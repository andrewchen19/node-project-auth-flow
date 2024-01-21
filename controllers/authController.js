const User = require("../models/User");
const Token = require("../models/Token");

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validation");

const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  hashString,
} = require("../utils");

// build-in module
const crypto = require("crypto");

const register = async (req, res) => {
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { email, name, password } = req.body;

  const foundEmail = await User.findOne({ email });
  if (foundEmail) {
    // Conflict
    return res.status(409).json({ msg: "Email is already registered" });
  }

  // first registered user's role is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // create verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  try {
    // 儲存前，會先進到 Mongoose Middleware
    await User.create({
      name,
      email,
      password,
      role,
      verificationToken: hashString(verificationToken),
    });

    const origin = "http://localhost:3000";
    // const newOrigin = 'https://react-node-user-workflow-front-end.netlify.app';

    // send email
    await sendVerificationEmail({ name, email, verificationToken, origin });

    res.status(201).json({
      msg: "Success! Please check your email to verify account",
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const verifiedEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // check verification token is the same or not
    if (user.verificationToken !== hashString(verificationToken)) {
      return res.status(401).json({ msg: "Verification failed" });
    }

    user.isVerified = true;
    user.verified = new Date();
    user.verificationToken = null;

    await user.save();

    res.status(200).json({ msg: "Email verified" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const login = async (req, res) => {
  const { error } = loginValidation(req.body);
  console.log(error);

  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      msg: "User not found, please double-check the email for accuracy",
    });
  }

  // Instance Method
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json({ msg: "Password incorrect. Please double-check the password" });
  }

  // check whether user has verified the email
  if (!user.verified) {
    return res.status(401).json({ msg: "Please verified your email" });
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = "";

  // check for existing token (instance of Token)
  const existToken = await Token.findOne({ user: user._id });

  if (existToken) {
    const { isValid } = existToken;

    // 後端可手動修改此選項 (改成 false)，讓使用者從此無法登入
    // 確保只有合法的用戶可以使用
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    // use same refresh token
    refreshToken = existToken.refreshToken;

    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res.status(200).json({
      msg: "Login Successful",
      user: tokenUser,
    });

    return;
  }

  // create refresh token (without existing token)
  refreshToken = crypto.randomBytes(32).toString("hex");

  // other fields
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  // create new Token instance
  await Token.create({
    refreshToken,
    userAgent,
    ip,
    user: user._id,
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(200).json({
    msg: "Login Successful",
    user: tokenUser,
  });
};

const logout = async (req, res) => {
  try {
    // remove token
    await Token.deleteOne({ user: req.user.userId });

    // remove cookies
    res.cookie("accessToken", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.cookie("refreshToken", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    res.status(200).json({ msg: "Logout Successful" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const forgotPassword = async (req, res) => {
  const { error } = forgotPasswordValidation(req.body);

  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  // find user
  if (user) {
    // create password token
    const passwordToken = crypto.randomBytes(32).toString("hex");

    // create password token expired date
    // restrict the time for user to reset password
    const tenMinutes = 1000 * 60 * 10;

    // update user
    user.passwordToken = hashString(passwordToken);
    user.passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    await user.save();

    // send email
    const origin = "http://localhost:3000";
    await sendResetPasswordEmail({
      name: user.name,
      email,
      passwordToken,
      origin,
    });
  }

  // 無論是否找到 user，都會顯示該文字 (讓 hacker 不知 database 是否有該 user)
  res.status(200).json({
    msg: "Please check your email to reset password",
  });
};

const resetPassword = async (req, res) => {
  const { error } = resetPasswordValidation(req.body);

  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { token, email, password } = req.body;

  const user = await User.findOne({ email });

  // find user
  if (user) {
    if (user.passwordToken !== hashString(token)) {
      return res.status(401).json({ msg: "Reset password failed" });
    }

    const currentDate = Date.now();
    if (user.passwordTokenExpirationDate < currentDate) {
      return res
        .status(401)
        .json({ msg: "Password Token is expired. Please do it again." });
    }

    // Instance Method
    const isPasswordSame = await user.comparePassword(password);
    if (isPasswordSame) {
      return res
        .status(400)
        .json({ msg: "New password must be different from origin" });
    }

    user.password = password;
    user.passwordToken = null;
    user.passwordTokenExpirationDate = null;
    // 儲存前，會先進到 Mongoose Middleware
    await user.save();
  }

  res.status(200).json({ msg: "Reset password" });
};

module.exports = {
  register,
  verifiedEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};

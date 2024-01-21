// custom local middleware

const jwt = require("jsonwebtoken");
const Token = require("../models/Token");

const { attachCookiesToResponse } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  // verify token
  try {
    // when access token unexpired
    if (accessToken) {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      //console.log(payload);
      req.user = payload.user;
      // 當你在 middleware 中呼叫 next() 或 return next() 時，它們都會將控制權傳遞給下一個 middleware 或路由處理程序
      // 然而，return next() 在執行後會立即結束當前 middleware 的執行，而不會繼續執行後續的 code；next() 則會繼續執行後續的 code
      return next();
    }

    // when access token expired (accessToken 變成 undefined)
    // 步驟 1： we need to check if refresh token exist and valid or not
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    //console.log(payload);
    const existingRefreshToken = await Token.findOne({
      user: payload?.user?.userId,
      refreshToken: payload?.refreshToken,
    });
    if (!existingRefreshToken || !existingRefreshToken?.isValid) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
    // 步驟 2：if refresh token exist and valid, we send cookies again
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: payload.refreshToken,
    });
    // 步驟 3： next()
    req.user = payload.user;
    next();
  } catch (error) {
    // 處理 other situations (for example：when refresh token expired)
    return res.status(401).json({ msg: "Not authorized to this route" });
  }
};

// 可能會有多個 roles 能同時進入某個 route 的情況
// rest parameter (蒐集多個 elements，並壓縮成單個 Array)
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Forbidden
      return res.status(403).json({ msg: "Not authorized to this route" });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};

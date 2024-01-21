const jwt = require("jsonwebtoken");

// two cookies
const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = jwt.sign({ user }, process.env.JWT_SECRET);
  const refreshTokenJWT = jwt.sign(
    { user, refreshToken },
    process.env.JWT_SECRET
  );

  const fiveSeconds = 1000 * 5;
  const fifteenMinutes = 1000 * 60 * 15;
  const aMonth = 1000 * 60 * 60 * 24 * 30;

  // access token usually have a shorter lifespan as they are directly used for accessing resources
  // If an access token is compromised (被竊取) or misused, the shorter expiration reduces the risk
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    // 設定過期時間，接受毫秒
    maxAge: fiveSeconds,
  });

  // refresh token usually have a longer lifespan
  // refresh token is used to request a new access token when the current access token expires
  // 如果 refresh token 過期，用戶就必須重新登入
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    // 設定過期時間，接受 Date 物件
    expires: new Date(Date.now() + aMonth),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = jwt.sign(user, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//     signed: true,
//   });
// };

module.exports = attachCookiesToResponse;

const attachCookiesToResponse = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermission = require("./checkPermission");
const sendVerificationEmail = require("./sendVerificationEmail");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const hashString = require("./hashString");

module.exports = {
  attachCookiesToResponse,
  createTokenUser,
  checkPermission,
  sendVerificationEmail,
  sendResetPasswordEmail,
  hashString,
};

const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  newOrigin,
}) => {
  const verifyURL = `${newOrigin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>To ensure the security of your account, please verify your email by clicking on the link below : 
  <a href="${verifyURL}">Verify Account</a></p>`;

  return sendEmail({
    to: email,
    subject: "Verify Account",
    html: `<h4> Hello, ${name}</h4>
  ${message}
  `,
  });
};

module.exports = sendVerificationEmail;

// a module for Node.js applications to allow email sending
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  // configuration ( create a fake email account for testing by Ethereal)
  // 輸入這邊的帳密，就可以登入 Ethereal 來查看 email 的情況
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "loyal.franecki6@ethereal.email",
      pass: "KmqcbaJ1A8w2h1V8S4",
    },
  });

  // send mail with defined transport object
  return transporter.sendMail({
    from: '"Andrew Chen 💩" <andrew@example.com>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;

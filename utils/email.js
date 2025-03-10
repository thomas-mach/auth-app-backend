const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    service: "gmail", //Gmail server SMTP
    auth: {
      user: "m4chtomasz@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Thomas Mach <m4chtomasz@gmail.com>",
    to:
      process.env.NODE_ENV === "production"
        ? options.email
        : "m4chtomasz@gmail.com",
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

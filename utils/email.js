const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    service: "gmail", // Usa Gmail come server SMTP
    auth: {
      user: "m4chtomasz@gmail.com",
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  console.log("TRANSPORTER = ", transporter);

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
  //   const info = await transporter.sendMail(mailOptions);
  //   console.log("Email sent successfully:", info);
};

module.exports = sendEmail;

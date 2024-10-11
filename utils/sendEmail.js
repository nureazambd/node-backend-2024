const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using Gmail service and App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // The App Password you generated
    },
  });

  // Define email options
  const mailOptions = {
    from: `YourApp <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

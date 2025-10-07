const nodemailer = require('nodemailer');

const sendEmail = async options => {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) Define the email options
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // 3) Send the email and return the result
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  } catch (error) {
    // This is the key change! Log the detailed error from Nodemailer.
    console.error('Nodemailer Error:', error);
    // Re-throw the error so the calling function can still handle it
    throw new Error('Failed to send email.');
  }
};

module.exports = sendEmail;
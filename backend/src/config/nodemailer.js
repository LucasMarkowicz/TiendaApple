const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'karlee46@ethereal.email',
    pass: 'hnK1NeM5SFMPWwe7tW'
  }
});

async function sendEmail(userEmail) {
  try {
    const info = await transporter.sendMail({
      from: 'karlee46@ethereal.email', 
      to: userEmail,
      subject: 'Account Deletion Notification',
      text: 'Your account has been deleted due to inactivity.'
    });
    console.log('Email sent: ' + info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  transporter,
  sendEmail,
};
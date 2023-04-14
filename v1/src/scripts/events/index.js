const eventEmitter = require('./eventEmitter');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.PORT,
  service: 'gmail',
  auth: {
    user: 'hiveproject67@gmail.com',
    pass: 'axbitorzxxclunez'
  }
});

const sendMail = async (emailData) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...emailData
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

eventEmitter.on('send_email', sendMail);

module.exports = eventEmitter;

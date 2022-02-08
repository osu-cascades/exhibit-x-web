const nodemailer = require("nodemailer");

const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

const createTransporter = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
  });

  return transporter;
};

module.exports = { createTransporter };
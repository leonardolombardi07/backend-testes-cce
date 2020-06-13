const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const keys = require("../config/keys");

exports.transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: keys.sendGridApiKey,
    },
  })
);

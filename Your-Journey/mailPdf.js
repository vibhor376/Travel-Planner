const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const mailConfig = require('./config/mailer_config.json');

exports.mailPdf = async (email, name) => {
   try {
      const transporter = nodemailer.createTransport(mailConfig);

      const attachments = [{
         filename: 'output.pdf',
         content: await readFileAsync(path.join(__dirname, 'output.pdf')),
         contentType: 'application/pdf',
      }];

      const mailOptions = {
         from: '19001015063@jcboseust.ac.in',
         to: email,
         subject: 'Your journey details',
         text: "Hello " + name + ", here's your planned journey",
         attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
   } catch (error) {
      console.error('Error sending email: ', error);
   }
}


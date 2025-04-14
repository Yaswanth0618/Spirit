const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yourgmail@gmail.com',        // replace with your Gmail
      pass: 'your_app_password'           // replace with App Password
    }
  });

  const mailOptions = {
    from: email,
    to: 'sharivats2007@gmail.com',
    subject: `[Spirit Contact] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
      res.status(500).send('❌ Error sending message');
    } else {
      res.status(200).send('✅ Message sent successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Contact server listening at http://localhost:${PORT}`);
});

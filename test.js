const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4000;

app.use(express.json());

// Send test email
app.get('/send-email', (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'taskmate3@gmail.com',
      pass: 'qnwb aatc aljk vpfr'
    }
  });

  const mailOptions = {
    from: 'taskmate3@gmail.com',
    to: 'raviralamani5@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email from Nodemailer'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }

    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

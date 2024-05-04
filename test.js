const express = require('express');
const { deductCredit, getCredits } = require('./controllers/creditsController');

const app = express();
const PORT = 4000;

app.use(express.json());


// Send test email
app.post('/deduct', async (req, res) => {
  const { email } = req.body;
  try {
    const response = await deductCredit({ email });
    res.send(response);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/getCredits', async (req, res) => {
  const { email } = req.body;
  try {
    const credits = await getCredits({ email });
    res.send(credits);
  } catch (error) {
    res
      .status(400)
      .send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


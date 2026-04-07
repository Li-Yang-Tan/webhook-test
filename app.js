// Import Express.js
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// WhatsApp API config (PUT THESE IN .env ideally)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = "v20.0";

// --------------------
// VERIFY WEBHOOK (GET)
// --------------------
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// --------------------
// SEND MESSAGE FUNCTION
// --------------------
async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: text
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.log("Error sending message:", err.response?.data || err.message);
  }
}

// --------------------
// RECEIVE MESSAGES (POST)
// --------------------
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from; // user phone number

      console.log("Message from:", from);

      // 🔥 SIMPLE AUTO REPLY
      await sendMessage(from, "hello to u too");
    }

  } catch (err) {
    console.log("Error:", err.message);
  }

  res.status(200).end();
});

// --------------------
// START SERVER
// --------------------
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

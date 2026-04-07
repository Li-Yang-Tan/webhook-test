// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post("/", async (req, res) => {
  const body = req.body;

  try {
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // If no message → ignore
    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body;

    console.log("User message:", text);

    // OPTIONAL SAFETY CHECK (prevents loops)
    if (message.from_me === true) {
      return res.sendStatus(200);
    }

    const url = "https://graph.facebook.com/v25.0/1051767714691735/messages";

    const accessToken = "YOUR_TOKEN";

    const payload = {
      messaging_product: "whatsapp",
      to: from, // 🔥 reply to sender dynamically
      type: "text",
      text: {
        body: "hello to u too"
      }
    };

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(200);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

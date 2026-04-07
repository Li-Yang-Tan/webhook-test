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
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  const url = "https://graph.facebook.com/v25.0/1051767714691735/messages";

  const accessToken = "EAAXlzqMNxZCMBRHmgqisyvr2a8BfjD45ga0ZCtkkdVDojO7ze3dZBLQQjEzAPJBCOaL6jV9fOvq1PDZBr4QSKCXwVb9NxjkSfVybZAPphtDoZCGNoKnDIG8XqafEWaYHgMr7otNe6JoAT2JJUH0InoXR2x1q2QfwPHG1LbqiIk2BMAZAvRPPVKW0KGvvfS7E1MY68GkE2S0Bp35okiquNLKHZC1xZCcLSONst87Jj";
  
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "+60178290173",
    type: "text",
    text: {
      preview_url: true, // or true
      body: "hello to u too"
    }
  };
  
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log("Response:", data);
    })
    .catch(err => {
      console.error("Error:", err);
    });
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

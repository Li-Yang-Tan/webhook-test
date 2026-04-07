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
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const type = message.type;

  if (type === "text") {
    const text = message.text?.body;

    await sendWhatsAppMessage(from, `You said: ${text}`);
  }

  res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

async function sendWhatsAppMessage(to, body) {
  const url = "https://graph.facebook.com/v25.0/1051767714691735/messages";

  const accessToken = process.env.WHATSAPP_TOKEN || "EAAXlzqMNxZCMBRHmgqisyvr2a8BfjD45ga0ZCtkkdVDojO7ze3dZBLQQjEzAPJBCOaL6jV9fOvq1PDZBr4QSKCXwVb9NxjkSfVybZAPphtDoZCGNoKnDIG8XqafEWaYHgMr7otNe6JoAT2JJUH0InoXR2x1q2QfwPHG1LbqiIk2BMAZAvRPPVKW0KGvvfS7E1MY68GkE2S0Bp35okiquNLKHZC1xZCcLSONst87Jj";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: body
        }
      })
    });

    const data = await response.json();

    console.log("📩 WhatsApp API response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Failed to send message:", data);
      return { success: false, error: data };
    }

    return { success: true, data };

  } catch (error) {
    console.error("Network/Server error sending WhatsApp message:", error);

    return { success: false, error };
  }
}

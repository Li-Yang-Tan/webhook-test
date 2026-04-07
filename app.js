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

  else if (type === "image") {
    const imageId = message.image?.id;
    const caption = message.image?.caption;

    console.log("Image received:", imageId);

    await sendWhatsAppMessage(from, "Nice image 👍");
  }

  else if (type === "video") {
    const videoId = message.video?.id;

    console.log("Video received:", videoId);

    await sendWhatsAppMessage(from, "Got your video 🎥");
  }

  else if (type === "audio") {
    const audioId = message.audio?.id;

    console.log("Audio received:", audioId);

    await sendWhatsAppMessage(from, "Got your audio 🎧");
  }

  else if (type === "document") {
    const docId = message.document?.id;
    const filename = message.document?.filename;

    console.log("Document:", filename);

    await sendWhatsAppMessage(from, `Received file: ${filename}`);
  }

  else {
    console.log("Unhandled type:", type);
  }

  res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

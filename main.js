// main.js
require('./utils/logger.js');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

// Global Config
global.config = require('./config.json');
global.startTime = Date.now();

// Handlers
const { handleMessage } = require('./handles/handleMessage.js');
const { handlePostback } = require('./handles/handlePostback.js');
const { handleComment } = require('./handles/handleComment.js');

// Express App
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Uptime Function
global.uptime = () => {
  const uptimeMs = process.uptime() * 1000;
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
  const seconds = Math.floor((uptimeMs / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Example Root Endpoint
app.get('/', (req, res) => {
  res.send('Bot is running ✅');
});

// Example POST for Messages
app.post('/webhook/messages', async (req, res) => {
  try {
    await handleMessage(req.body);
    res.sendStatus(200);
  } catch (err) {
    log.error(`Message Handler Error: ${err}`);
    res.sendStatus(500);
  }
});

// Example POST for Postbacks
app.post('/webhook/postbacks', async (req, res) => {
  try {
    await handlePostback(req.body);
    res.sendStatus(200);
  } catch (err) {
    log.error(`Postback Handler Error: ${err}`);
    res.sendStatus(500);
  }
});

// Example POST for Comments
app.post('/webhook/comments', async (req, res) => {
  try {
    await handleComment(req.body);
    res.sendStatus(200);
  } catch (err) {
    log.error(`Comment Handler Error: ${err}`);
    res.sendStatus(500);
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log.success(`Bot started on port ${PORT}`);
});

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { generateWord } = require('./utils/generateWord');

const app = express();
const PORT = 8080;

const origin = process.env.NODE_ENV === 'production' ? 'https://www.kazuar.com.ua' : 'http://localhost:3000';
app.use(cookieParser());
app.use(cors({
  origin,
  credentials: true, // allow cookies
}));

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, './frontend/build');
  app.use(express.static(buildPath));

  // Serve index.html for all unknown routes
  app.get(/^\/(?!api|socket).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.get('/api/get-random-id', (req, res) => {

  let randomId = req.cookies.randomId;
  if (!randomId) {
    randomId = generateWord();
    res.cookie('randomId', randomId, {
      maxAge: 120000,
      httpOnly: true,   // JS in browser cannot read/write it
      secure: process.env.NODE_ENV === 'production', // only https in prod
      sameSite: 'None',
      path: '/',
    });
  }
  res.json({ randomId });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin, // frontend origin
    credentials: true
  }
});

const userMap = new Map();

io.on('connection', (socket) => {
  const cookies = socket.handshake.headers.cookie;
  let randomId = null;

  if (cookies) {
    const cookieObj = Object.fromEntries(
      cookies.split(';').map(c => c.trim().split('='))
    );
    randomId = cookieObj.randomId;
  }

  // Generate new randomId if missing
  if (!randomId) {
    randomId = generateWord();
    // send it to client to store as cookie
    socket.emit('setRandomId', randomId);
  }

  // Store mapping
  userMap.set(randomId, socket.id);

  socket.on('message', (msg) => {
    socket.emit('message', `Server received: ${msg}`);
  });

  socket.on('disconnect', () => {
    userMap.delete(randomId);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
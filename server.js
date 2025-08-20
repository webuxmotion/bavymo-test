const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 8080;

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, './frontend/build');
  app.use(express.static(buildPath));

  // Serve index.html for all unknown routes
  app.get(/^\/(?!api|socket).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Received:', msg, 'from', socket.id);
    socket.emit('message', `Server received: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
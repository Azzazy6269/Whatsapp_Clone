const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000, 
  cors: {
    origin: "http://localhost:3000",
  }
});

// WebSockets (Socket.io)

io.on('connection', (socket) => {
  console.log('Connected to socket.io successfully ✅');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(`User signed in and joined private room: ${userData._id}`);
    socket.emit('connected');
  });

  socket.on('join chat', (roomId) => {
    socket.join(roomId);
    console.log(`User joined chat room: ${roomId}`);
  });

  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.off('setup', () => {
    console.log('User Disconnected ❌');
    socket.leave(userData._id);
  });
});

// =========================================================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const pool = require('../db/postgres');
const connectMongoDB = require('../db/mongodb');
const { connectRedis } = require('./utils/redis');
const { connect: connectRabbitMQ } = require('./queue/rabbitmq');
const app = require('./app');
const { authenticateSocket } = require('./middleware/socketAuth');
const ChatMessage = require('./models/ChatMessage');

const PORT = process.env.PORT || 3001;

async function initializeConnections() {

  try {
    const result = await pool.query('SELECT NOW() as now');
    console.log(` [Port ${PORT}] PostgreSQL connected at:`, result.rows[0].now);
  } catch (error) {
    console.error(`[Port ${PORT}] PostgreSQL connection failed:`, error.message);
  }
  

  await connectMongoDB();
  

  connectRedis();
  
 
  await connectRabbitMQ();
}

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

app.set('io', io);
global.io = io;


io.use(authenticateSocket);


io.on('connection', (socket) => {
  console.log(`[Port ${PORT}] User connected:`, socket.user.id);
  

  socket.join(`user:${socket.user.id}`);
  

  socket.on('join_chat', (roomId) => {
    if (!roomId || roomId === 'undefined') {
      console.error(`[Port ${PORT}] Invalid roomId:`, roomId);
      socket.emit('error', { message: 'Invalid room ID' });
      return;
    }
    
    socket.join(`chat:${roomId}`);
    console.log(`[Port ${PORT}] User ${socket.user.id} joined chat ${roomId}`);
  });
  

  socket.on('send_message', async ({ roomId, message }) => {
    try {
      console.log(`[Port ${PORT}] Saving message from user ${socket.user.id} to room ${roomId}`);
      
      if (!roomId || roomId === 'undefined') {
        throw new Error('Invalid room ID');
      }
      
      if (!message || !message.trim()) {
        throw new Error('Message cannot be empty');
      }
      
     
      const chatMessage = await ChatMessage.create({
        roomId,
        senderId: socket.user.id.toString(),
        senderName: `${socket.user.firstName || 'User'} ${socket.user.lastName || ''}`.trim(),
        message: message.trim(),
        timestamp: new Date()
      });
      
      console.log(`[Port ${PORT}] Message saved:`, chatMessage._id);
      
   
      io.to(`chat:${roomId}`).emit('new_message', chatMessage);
      
    } catch (error) {
      console.error(` [Port ${PORT}] Error saving message:`, error.message);
      socket.emit('error', { message: 'Failed to send message: ' + error.message });
    }
  });
  
  socket.on('typing', (roomId) => {
    if (!roomId || roomId === 'undefined') return;
    
    socket.to(`chat:${roomId}`).emit('user_typing', {
      userId: socket.user.id,
      username: socket.user.firstName || 'User'
    });
  });
  
  
  socket.on('leave_chat', (roomId) => {
    if (!roomId || roomId === 'undefined') return;
    
    socket.leave(`chat:${roomId}`);
    console.log(` [Port ${PORT}] User ${socket.user.id} left chat ${roomId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(` [Port ${PORT}] User disconnected:`, socket.user.id);
  });
});

initializeConnections().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
   
  });
});


const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
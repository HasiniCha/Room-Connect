const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();


app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  const port = process.env.PORT || '3001';
  console.log(`[${port}] ${req.method} ${req.path}`);
  next();
});


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString()
  });
});


app.get('/test-db', async (req, res) => {
  try {
    const pool = require('../db/postgres');
    const result = await pool.query('SELECT NOW() as time, current_database() as db');
    res.json({ 
      success: true,
      port: process.env.PORT || 3001,
      database: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


try {
  const propertyRoutes = require('./routes/propertyRoutes');
  app.use('/api/properties', propertyRoutes);
} catch (error) {
  console.log(' Property routes not loaded:', error.message);
}
try {
  const chatRoutes = require('./routes/chatRoutes');
  app.use('/api/chat', chatRoutes);
  console.log('Chat routes loaded');
} catch (error) {
  console.log('Chat routes not loaded:', error.message);
}
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  app.use('/api/bookings', bookingRoutes);
} catch (error) {
  console.log('Booking routes not loaded:', error.message);
}

try {
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
} catch (error) {
  console.log('Payment routes not loaded:', error.message);
}

try {
  const maintenanceRoutes = require('./routes/maintenanceRoutes');
  app.use('/api/maintenance', maintenanceRoutes);
} catch (error) {
  console.log('Maintenance routes not loaded:', error.message);
}
try {
  const chatRoutes = require('./routes/chatRoutes');
  app.use('/api/chat', chatRoutes);
} catch (error) {
  console.log('Chat routes not loaded:', error.message);
}


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
/**
 * MAGNUS Backend Server
 * Main entry point for the backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();  // ← Declare ONCE
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://sat.magnus.co.il', // Production frontend
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// CRITICAL: Capture raw body for webhook signature verification
// This MUST come BEFORE other body parsers for webhook routes
app.use('/api/webhooks', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Body parsers for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Webhook routes (declared ONCE)
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

// TODO: Add other routes
// const deviceRoutes = require('./routes/devices');
// app.use('/api/inreach/devices', deviceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 MAGNUS Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Webhook: http://localhost:${PORT}/api/webhooks/test`);
  console.log(`Webhook Secret: ${process.env.WORDPRESS_WEBHOOK_SECRET ? '✓ Configured' : '✗ Missing'}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

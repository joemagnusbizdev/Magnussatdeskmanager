# 🚀 MAGNUS Backend - Complete Code Package

All backend files needed to deploy the webhook receiver and API endpoints.

---

## 📦 **File Structure**

```
backend/
├── server.js                # Main server file
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
└── routes/
    └── webhooks.js          # Webhook routes
```

---

## 📄 **FILE 1: server.js**

Create file: `backend/server.js`

```javascript
/**
 * MAGNUS Backend Server
 * Main entry point for the backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
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
    // Add your frontend domains here
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
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

// Webhook routes
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

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
```

---

## 📄 **FILE 2: routes/webhooks.js**

Create file: `backend/routes/webhooks.js`

**(See BACKEND_WEBHOOKS_CODE.md for the full webhooks.js file - it's 10 KB)**

Or download separately from outputs folder.

---

## 📄 **FILE 3: package.json**

Create file: `backend/package.json`

```json
{
  "name": "magnus-backend",
  "version": "1.0.0",
  "description": "MAGNUS SatDesk Manager Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "garmin",
    "inreach",
    "rental",
    "management"
  ],
  "author": "MAGNUS",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

---

## 📄 **FILE 4: .env.example**

Create file: `backend/.env.example`

```env
# MAGNUS Backend Environment Variables

# Server Configuration
NODE_ENV=production
PORT=3001

# Webhook Secret (MUST match WordPress webhook secret)
WORDPRESS_WEBHOOK_SECRET=your_secret_key_here

# CORS Allowed Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://sat.magnus.co.il

# Database Configuration (TODO: Add when ready)
# DATABASE_URL=postgresql://user:password@localhost:5432/magnus

# Garmin API Configuration (TODO: Add when ready)
# GARMIN_API_URL=https://api.garmin.com
# GARMIN_API_KEY=your_garmin_api_key

# Command Center Configuration (TODO: Add when ready)
# COMMAND_CENTER_URL=your_command_center_url
# COMMAND_CENTER_API_KEY=your_command_center_key
```

---

## 🚀 **Quick Deployment to Render**

### **Step 1: Add to GitHub**

```bash
cd Magnussatdeskmanager
mkdir -p backend/routes
# Copy all 4 files above to their respective locations
git add backend/
git commit -m "Add backend API server"
git push
```

### **Step 2: Create Web Service on Render**

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - **Name:** `magnus-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or Starter

### **Step 3: Add Environment Variables**

In Render dashboard → Environment tab:

```
NODE_ENV = production
WORDPRESS_WEBHOOK_SECRET = [your secret key from WordPress setup]
CORS_ORIGINS = http://localhost:3000,https://sat.magnus.co.il
```

### **Step 4: Deploy**

Click "Create Web Service" - wait 2-3 minutes

### **Step 5: Test**

```bash
# Health check
curl https://magnus-garmin-ecc.onrender.com/health

# Webhook test
curl https://magnus-garmin-ecc.onrender.com/api/webhooks/test
```

---

## ✅ **What This Gives You**

### **Endpoints:**

1. **POST /api/webhooks/woocommerce-order**
   - Receives orders from WordPress
   - Verifies HMAC signature
   - Stores in memory (or database)

2. **GET /api/webhooks/orders**
   - Returns all orders
   - Supports `?status=new` filter

3. **GET /api/webhooks/orders/:orderId**
   - Returns specific order
   - Frontend uses this to pre-fill data

4. **PATCH /api/webhooks/orders/:orderId**
   - Updates order status

5. **DELETE /api/webhooks/orders/:orderId**
   - Cancels order

6. **GET /api/webhooks/stats**
   - Returns statistics

7. **GET /api/webhooks/test**
   - Test endpoint connectivity

---

## 🎯 **End-to-End Flow After Deployment**

```
Customer places order on sat.magnus.co.il
              ↓
WordPress sends webhook
              ↓
Backend receives & verifies signature ✅
              ↓
Backend stores order in memory
              ↓
Frontend CS Dashboard fetches orders
              ↓
Shows real order (not mock data!) ✅
              ↓
CS rep clicks order
              ↓
Frontend fetches order details
              ↓
ALL DATA PRE-FILLED! ✅
              ↓
CS rep: Assign Devices → Review → Activate
              ↓
Done in 3 minutes! (was 10 minutes)
```

---

## 🔐 **Security Features**

✅ HMAC SHA-256 signature verification  
✅ Timestamp validation (prevents replay)  
✅ CORS restrictions  
✅ Helmet security headers  
✅ Environment variables  
✅ HTTPS (Render provides SSL)  

---

## 📊 **Current Limitations**

⚠️ **In-Memory Storage**
- Orders stored in RAM
- Lost on server restart
- **TODO:** Add PostgreSQL database

⚠️ **No Authentication**
- Anyone can access order API
- **TODO:** Add JWT authentication

⚠️ **No Rate Limiting**
- Vulnerable to abuse
- **TODO:** Add rate limiting

---

## 🎯 **Next Enhancements**

1. **Add PostgreSQL database**
2. **Add authentication (JWT)**
3. **Add rate limiting**
4. **Add WebSocket for real-time updates**
5. **Add Garmin API integration**
6. **Add Command Center integration**
7. **Add email notifications**

---

## 📞 **Testing Checklist**

- [ ] Backend deployed to Render
- [ ] Health check returns `{"status": "ok"}`
- [ ] Webhook test returns `{"configured": true}`
- [ ] WordPress sends test order successfully
- [ ] Backend logs show received order
- [ ] Frontend CS Dashboard shows real order
- [ ] Click order → Data pre-fills
- [ ] No CORS errors

---

**Created for:** MAGNUS SatDesk Manager  
**Version:** 1.0  
**Date:** December 2024

# Backend Integration Guide

## 🎯 Overview

This document explains how the inReach Manager frontend integrates with your Magnus Garmin ECC backend on Render.

## 📁 Files Created

### API Service Layer (`/services/api/`)
- `client.ts` - Axios client with API key authentication
- `devices.ts` - Device management API calls
- `rentals.ts` - Rental management API calls  
- `users.ts` - User management API calls
- `satdesks.ts` - SatDesk & preset messages API calls
- `orders.ts` - Order processing API calls
- `alerts.ts` - Alert/notification API calls
- `index.ts` - Central exports

### Stores
- `appConfigStore.ts` - Global app configuration (API mode, feature flags)
- `deviceStore.ts` - Device data with API integration

### Components
- `components/settings/ApiConfiguration.tsx` - Backend connection settings UI

### Configuration
- `.env` - Environment variables (add your API key here)
- `.env.example` - Template for environment variables

## 🔧 Setup Instructions

### 1. Add Your API Key

Edit `/.env` and add your API key:

```env
VITE_API_BASE_URL=https://magnus-garmin-ecc.onrender.com
VITE_API_KEY=your_actual_api_key_here
```

### 2. Configure Backend Connection

1. Go to **Settings** → **Backend API** tab
2. Enter your API URL: `https://magnus-garmin-ecc.onrender.com`
3. Enter your API key
4. Click **Test Connection**
5. If successful, click **Save Configuration**

### 3. Toggle Mock Mode

- **Mock Mode ON**: Uses fake data (no backend needed)
- **Mock Mode OFF**: Uses real backend API

Toggle in **Settings** → **Backend API** → **Mock Data Mode**

## 🔑 Authentication

The frontend uses **API Key** authentication:

```typescript
// All API requests include this header:
headers: {
  'X-API-Key': 'your_api_key'
}
```

## 📡 API Endpoints Expected

Your backend should implement these endpoints:

### Devices
```
GET    /api/inreach/devices
POST   /api/inreach/devices
GET    /api/inreach/devices/:id
PUT    /api/inreach/devices/:id
DELETE /api/inreach/devices/:id
GET    /api/inreach/devices/imei/:imei
POST   /api/inreach/devices/:id/activate
POST   /api/inreach/devices/:id/assign
POST   /api/inreach/devices/:id/cleanup
GET    /api/inreach/devices/:id/history
POST   /api/inreach/devices/bulk-assign
```

### Rentals
```
GET    /api/inreach/rentals
POST   /api/inreach/rentals
GET    /api/inreach/rentals/:id
PUT    /api/inreach/rentals/:id
DELETE /api/inreach/rentals/:id
POST   /api/inreach/rentals/:id/complete
POST   /api/inreach/rentals/:id/cancel
POST   /api/inreach/rentals/:id/extend
GET    /api/inreach/rentals/expiring?days=7
```

### Users
```
GET    /api/inreach/users
POST   /api/inreach/users
GET    /api/inreach/users/:id
PUT    /api/inreach/users/:id
DELETE /api/inreach/users/:id
GET    /api/inreach/users/:id/rentals
```

### SatDesks
```
GET    /api/inreach/satdesks
POST   /api/inreach/satdesks
GET    /api/inreach/satdesks/:id
PUT    /api/inreach/satdesks/:id
DELETE /api/inreach/satdesks/:id
GET    /api/inreach/satdesks/:id/devices
POST   /api/inreach/satdesks/:id/test-login
GET    /api/inreach/satdesks/:id/preset-messages
POST   /api/inreach/satdesks/:id/preset-messages
PUT    /api/inreach/satdesks/:id/preset-messages/:messageId
DELETE /api/inreach/satdesks/:id/preset-messages/:messageId
```

### Orders
```
GET    /api/inreach/orders
GET    /api/inreach/orders/:id
GET    /api/inreach/orders/order/:orderId
POST   /api/inreach/orders/:id/process
POST   /api/inreach/orders/:id/cancel
POST   /api/inreach/orders/manual
```

### Alerts
```
GET    /api/inreach/alerts
GET    /api/inreach/alerts/:id
POST   /api/inreach/alerts/:id/read
POST   /api/inreach/alerts/:id/dismiss
POST   /api/inreach/alerts/read-all
POST   /api/inreach/alerts/dismiss-all
DELETE /api/inreach/alerts/:id
```

### Health & Features
```
GET    /health
GET    /api/admin/features
```

## 📊 Data Transformation

The frontend expects data in this format:

### Device Response
```typescript
{
  id: string;
  imei: string;
  device_number: number;
  satdesk_id: string;
  status: 'available' | 'assigned' | 'in_use' | 'maintenance' | 'retired';
  location: string;
  firmware_version: string;
  battery_level: number;
  last_check_in: string; // ISO timestamp
  activation_date: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  notes: string;
}
```

### Rental Response
```typescript
{
  id: string;
  device_id: string;
  user_id: string;
  order_id: string;
  start_date: string; // ISO timestamp
  end_date: string; // ISO timestamp
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'overdue';
  rental_type: 'rental' | 'purchase';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
}
```

## 🚨 Error Handling

The API client handles these error codes:

- **401**: Unauthorized (invalid API key)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **422**: Validation Error
- **500**: Server Error
- **503**: Service Unavailable (feature disabled)

All errors display toast notifications to the user.

## 🔄 Feature Flags

The backend can control frontend features via `/api/admin/features`:

```json
{
  "features": [
    {
      "name": "ENABLE_INREACH",
      "enabled": true,
      "description": "Enable inReach Manager module"
    },
    {
      "name": "ENABLE_INREACH_ECC_SYNC",
      "enabled": false,
      "description": "Enable bi-directional sync with ECC"
    },
    {
      "name": "ENABLE_GARMIN_API",
      "enabled": false,
      "description": "Enable real Garmin API calls"
    }
  ]
}
```

If `ENABLE_INREACH` is `false`, the frontend will show a warning message.

## 🧪 Testing

### Test with Mock Data
1. Go to Settings → Backend API
2. Toggle "Mock Data Mode" to ON
3. All data is local, no backend needed

### Test with Real Backend
1. Go to Settings → Backend API  
2. Toggle "Mock Data Mode" to OFF
3. Enter API URL and API Key
4. Click "Test Connection"
5. Navigate to Dashboard to see real data

## 📝 Next Steps for Backend Implementation

1. **Install the database migration scripts** I provided earlier
2. **Implement the API endpoints** listed above
3. **Add API key authentication** middleware
4. **Set feature flags** in your environment variables
5. **Deploy to Render** with `ENABLE_INREACH=true`

## 🆘 Troubleshooting

### "Connection Failed" Error
- Check that your API key is correct
- Verify backend URL is correct  
- Check backend logs for errors
- Ensure CORS is enabled on backend

### "Service Unavailable" Error
- Backend feature flag `ENABLE_INREACH` is disabled
- Ask admin to enable it in backend environment variables

### "Unauthorized" Error
- API key is invalid or missing
- Check `.env` file has correct `VITE_API_KEY`

### Data Not Showing
- Toggle Mock Mode ON to see if it's a backend issue
- Check browser console for API errors
- Verify backend is returning data in expected format

## 📞 Support

Need help implementing the backend?
- Review the database migration scripts in my previous message
- Check the API route structure examples
- Use the feature flag system for safe rollout

---

**Ready to connect!** 🚀

Just add your API key to `.env` and you're good to go!

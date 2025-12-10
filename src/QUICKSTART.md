# 🚀 Quick Start Guide

## What We Just Built

I've created a complete API integration layer for your inReach Manager React app that connects to your Magnus Garmin ECC backend on Render.

## 📦 What's Included

### ✅ API Service Layer
- Full REST API client with API key authentication
- Services for devices, rentals, users, satdesks, orders, and alerts
- Automatic error handling with toast notifications
- Support for both mock and real data modes

### ✅ State Management  
- `appConfigStore` - Manages API connection and mock mode
- `deviceStore` - Device data with API integration (example)
- Easy to extend other stores (rentals, users, etc.)

### ✅ UI Components
- Settings page with "Backend API" tab
- API connection tester
- Mock mode toggle
- Feature flag viewer

### ✅ Environment Setup
- `.env` file for API credentials
- Configuration system
- Development-friendly defaults

---

## 🎯 Next Steps - Choose Your Path

### Path A: Start Using Mock Data (Testing)

**Perfect if:** You want to test the frontend while backend is being built

1. The app is already in mock mode by default
2. Go to Settings → Backend API
3. You'll see "Mock Data Mode" is ON
4. All features work with fake data
5. **You're done!** Keep developing the frontend

---

### Path B: Connect to Real Backend

**Perfect if:** Your backend is ready with API endpoints

#### Step 1: Get Your API Key
Ask your backend admin for an API key

#### Step 2: Add API Key to Environment
Edit `/.env`:
```env
VITE_API_KEY=your_actual_api_key_here
```

#### Step 3: Test Connection
1. Go to **Settings** → **Backend API**
2. API URL should already be: `https://magnus-garmin-ecc.onrender.com`
3. Your API key should auto-fill from `.env`
4. Click **"Test Connection"**
5. If successful ✅, toggle "Mock Data Mode" OFF
6. Click **"Save Configuration"**

#### Step 4: Use Real Data
- Navigate to Dashboard
- Data now comes from your backend!
- All CRUD operations hit real API

---

### Path C: Implement Backend First

**Perfect if:** You need to build the backend endpoints

#### What Your Backend Needs:

**1. Database Tables** (use migration scripts I provided)
```sql
inreach.devices
inreach.rentals
inreach.users
inreach.satdesks
inreach.orders
inreach.alerts
```

**2. API Endpoints**
```
GET /api/inreach/devices
POST /api/inreach/devices
... (see BACKEND_INTEGRATION.md for full list)
```

**3. Authentication**
```javascript
// Middleware to check API key in header
headers: { 'X-API-Key': 'key_here' }
```

**4. Feature Flags**
```env
ENABLE_INREACH=true
```

**Reference Files:**
- Database migrations: See my previous message
- API routes structure: See my previous message
- Feature flags: See my previous message

---

## 🧪 How to Test

### Test Mock Mode (No Backend)
```bash
1. npm run dev
2. Go to http://localhost:5173
3. Navigate to Dashboard
4. You'll see fake devices, rentals, etc.
5. Everything works locally!
```

### Test Real API Mode (With Backend)
```bash
1. Add API key to .env
2. npm run dev
3. Settings → Backend API → Test Connection
4. Toggle Mock Mode OFF
5. Dashboard now shows real data from backend
```

---

## 📂 File Structure

```
/services/api/          # All API calls
  ├── client.ts         # Axios client + auth
  ├── devices.ts        # Device API
  ├── rentals.ts        # Rental API
  ├── users.ts          # User API
  ├── satdesks.ts       # SatDesk API
  ├── orders.ts         # Order API
  └── alerts.ts         # Alert API

/stores/
  ├── appConfigStore.ts # API config & feature flags
  └── deviceStore.ts    # Device data (API-enabled)

/components/settings/
  └── ApiConfiguration.tsx # Backend settings UI

/.env                   # Your API key goes here
```

---

## 🎨 Using the API in Your Components

### Example: Fetch Devices

```typescript
import { useDeviceStore } from '@/stores/deviceStore';

function MyComponent() {
  const { devices, loading, fetchDevices } = useDeviceStore();
  
  useEffect(() => {
    fetchDevices(); // Auto-uses mock or real API based on config
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {devices.map(device => (
        <div key={device.id}>{device.imei}</div>
      ))}
    </div>
  );
}
```

### Example: Create Device

```typescript
import { useDeviceStore } from '@/stores/deviceStore';

function CreateDevice() {
  const { createDevice } = useDeviceStore();
  
  const handleCreate = async () => {
    await createDevice({
      imei: '300434063679999',
      deviceNumber: 99,
      satDeskId: 'desk-1',
      status: 'available',
    });
    // Toast notification shows automatically!
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

---

## 🔄 Switching Between Mock and Real Data

**Via UI:**
1. Settings → Backend API
2. Toggle "Mock Data Mode"
3. Done!

**Via Code:**
```typescript
import { useAppConfigStore } from '@/stores/appConfigStore';

const { useMockData, setUseMockData } = useAppConfigStore();

// Check current mode
console.log(useMockData ? 'Using mock data' : 'Using real API');

// Switch mode
setUseMockData(false); // Use real API
setUseMockData(true);  // Use mock data
```

---

## ⚙️ Environment Variables

```env
# Required for real API mode
VITE_API_BASE_URL=https://magnus-garmin-ecc.onrender.com
VITE_API_KEY=your_api_key_here

# Optional (defaults shown)
# VITE_DEV_MODE=true
```

---

## 🚨 Common Issues

### Issue: "API Key Required" Error
**Solution:** Add `VITE_API_KEY` to `.env` file

### Issue: Connection Test Fails
**Solutions:**
- Check backend is running
- Verify API key is correct
- Check CORS is enabled on backend
- Look at browser console for details

### Issue: Mock Mode Won't Turn Off
**Solution:** You need a valid API key first. Add to `.env` then restart dev server

### Issue: Data Not Updating
**Solution:** 
- Check if you're in mock mode (Settings → Backend API)
- In mock mode, data is only in browser memory
- Toggle to real API mode to persist data

---

## 📚 Documentation

- **Backend Integration:** See `BACKEND_INTEGRATION.md`
- **API Endpoints:** See `BACKEND_INTEGRATION.md` - API section
- **Data Types:** See `/services/api/*.ts` files

---

## 🎉 You're All Set!

### Right Now You Can:
- ✅ Develop frontend with mock data
- ✅ Test UI without backend  
- ✅ Connect to real backend when ready
- ✅ Toggle between mock/real easily

### Your Next Step:
Choose **Path A, B, or C** above based on your situation!

---

**Questions?** Check `BACKEND_INTEGRATION.md` for detailed technical docs.

**Happy coding!** 🚀

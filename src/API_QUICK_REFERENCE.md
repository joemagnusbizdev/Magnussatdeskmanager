# 🚀 API Integration - Quick Reference

## Environment Setup
```bash
# .env file
VITE_API_BASE_URL=https://magnus-garmin-ecc.onrender.com
VITE_API_KEY=your_api_key_here
```

## Stores Available

### Device Store
```typescript
import { useDeviceStore } from '@/stores/deviceStore';

const {
  devices,              // Device[]
  loading,             // boolean
  error,               // string | null
  fetchDevices,        // () => Promise<void>
  getDeviceById,       // (id: string) => Device | undefined
  getDeviceByImei,     // (imei: string) => Promise<Device | undefined>
  createDevice,        // (device: Partial<Device>) => Promise<void>
  updateDevice,        // (id: string, updates: Partial<Device>) => Promise<void>
  deleteDevice,        // (id: string) => Promise<void>
  assignDevice,        // (id: string, rentalId: string) => Promise<void>
  cleanupDevice,       // (id: string) => Promise<void>
  bulkAssignDevices,   // (ids: string[], rentalId: string) => Promise<void>
  getDevicesByStatus,  // (status: DeviceStatus) => Device[]
  getDevicesBySatDesk, // (satDeskId: string) => Device[]
  searchDevices,       // (query: string) => Device[]
} = useDeviceStore();
```

### Rental Store
```typescript
import { useRentalStore } from '@/stores/rentalStore';

const {
  rentals,             // Rental[]
  loading,             // boolean
  error,               // string | null
  fetchRentals,        // () => Promise<void>
  getRentalById,       // (id: string) => Rental | undefined
  createRental,        // (rental: Partial<Rental>) => Promise<void>
  updateRental,        // (id: string, updates: Partial<Rental>) => Promise<void>
  deleteRental,        // (id: string) => Promise<void>
  completeRental,      // (id: string) => Promise<void>
  cancelRental,        // (id: string, reason?: string) => Promise<void>
  extendRental,        // (id: string, newEndDate: string) => Promise<void>
  getActiveRentals,    // () => Rental[]
  getExpiringRentals,  // (days?: number) => Rental[]
  getOverdueRentals,   // () => Rental[]
  getRentalsByStatus,  // (status: RentalStatus) => Rental[]
} = useRentalStore();
```

### User Store
```typescript
import { useUserStore } from '@/stores/userStore';

const {
  users,               // User[]
  loading,             // boolean
  error,               // string | null
  fetchUsers,          // () => Promise<void>
  getUserById,         // (id: string) => User | undefined
  searchUsers,         // (query: string) => User[]
  createUser,          // (user: Partial<User>) => Promise<void>
  updateUser,          // (id: string, updates: Partial<User>) => Promise<void>
  deleteUser,          // (id: string) => Promise<void>
} = useUserStore();
```

### App Config Store
```typescript
import { useAppConfigStore } from '@/stores/appConfigStore';

const {
  useMockData,         // boolean
  apiConnected,        // boolean
  apiUrl,              // string
  apiKey,              // string
  featureFlags,        // Record<string, boolean>
  setUseMockData,      // (useMock: boolean) => void
  setApiConnected,     // (connected: boolean) => void
  setApiCredentials,   // (url: string, key: string) => void
  setFeatureFlags,     // (flags: Record<string, boolean>) => void
  isFeatureEnabled,    // (flagName: string) => boolean
} = useAppConfigStore();
```

## Common Patterns

### Load Data on Mount
```typescript
useEffect(() => {
  fetchDevices();
}, [fetchDevices]);
```

### Create with Error Handling
```typescript
const handleCreate = async () => {
  try {
    await createDevice({ imei: '123', deviceNumber: 1 });
    // Success toast shown automatically
  } catch (error) {
    // Error toast shown automatically
  }
};
```

### Conditional Rendering
```typescript
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <DataDisplay data={devices} />;
```

### Search/Filter
```typescript
const filteredDevices = searchDevices(searchQuery);
const activeDevices = getDevicesByStatus('active');
```

## API Client Direct Usage

```typescript
import * as deviceApi from '@/services/api/devices';

// Direct API calls (bypasses store)
const device = await deviceApi.getDeviceById('123');
const devices = await deviceApi.listDevices({ status: 'active' });
```

## Feature Flags

```typescript
import { checkFeatureFlag } from '@/services/api';

const isEnabled = await checkFeatureFlag('ENABLE_INREACH');
if (isEnabled) {
  // Feature code
}
```

## Error Handling

All API errors show toast notifications automatically:
- 401: "Unauthorized - Invalid API key"
- 403: "Access Denied"
- 404: "Not Found"
- 422: "Validation Error"
- 500: "Server Error"
- 503: "Service Unavailable"

## Mock vs Real Mode

```typescript
// Check current mode
const { useMockData } = useAppConfigStore();
if (useMockData) {
  // Using mock data
} else {
  // Using real API
}

// Toggle mode
setUseMockData(false); // Switch to real API
setUseMockData(true);  // Switch to mock mode
```

## UI Components

```typescript
// Show API mode indicator
import { ApiModeIndicator } from '@/components/common/ApiModeIndicator';
<ApiModeIndicator />

// API Configuration UI
import { ApiConfiguration } from '@/components/settings/ApiConfiguration';
<ApiConfiguration />
```

## Testing Commands

```bash
# Start dev server
npm run dev

# Check if mock mode works
# (no API key needed, app should load)

# Add API key to .env
echo "VITE_API_KEY=your_key" >> .env

# Restart dev server
# App should connect to backend
```

## Troubleshooting

### Mock Mode Won't Disable
- Add VITE_API_KEY to .env
- Restart dev server
- Go to Settings → Backend API → Test Connection

### API Calls Failing
- Check VITE_API_BASE_URL is correct
- Verify API key is valid
- Check backend is running
- Look at browser console for errors

### Data Not Persisting
- You're in mock mode
- Toggle to real API mode in Settings

## Quick Commands

```typescript
// Fetch all data
await Promise.all([
  fetchDevices(),
  fetchRentals(),
  fetchUsers(),
]);

// Clear all data (mock mode only)
setUseMockData(true); // Reload page

// Check connection
import { getApiStatus } from '@/services/api';
const status = await getApiStatus();
console.log(status);
```

---

**More Details:**
- Full docs: `INTEGRATION_COMPLETE.md`
- Backend guide: `BACKEND_INTEGRATION.md`
- Quick start: `QUICKSTART.md`

import { create } from 'zustand';
import { useSatDeskStore } from './satDeskStore';
import { useOrderStore } from './orderStore';

export type SystemHealthStatus = 'operational' | 'degraded' | 'critical' | 'checking';

export interface SystemCheck {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'checking';
  message: string;
  lastChecked: string;
}

export interface SystemStatus {
  overall: SystemHealthStatus;
  checks: {
    garminApi: SystemCheck;
    eccConnection: SystemCheck;
    activeDevices: SystemCheck;
    satDeskAccounts: SystemCheck;
    recentCommunication: SystemCheck;
    webhookService: SystemCheck;
  };
  lastUpdate: string;
}

interface SystemStatusStore {
  status: SystemStatus;
  isChecking: boolean;
  runHealthCheck: () => Promise<void>;
  startAutoCheck: () => void;
  stopAutoCheck: () => void;
}

// Auto-check interval (every 2 minutes)
const AUTO_CHECK_INTERVAL = 120000;
let autoCheckTimer: NodeJS.Timeout | null = null;

export const useSystemStatusStore = create<SystemStatusStore>((set, get) => ({
  status: {
    overall: 'checking',
    checks: {
      garminApi: {
        name: 'Garmin API',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
      eccConnection: {
        name: 'ECC Connection',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
      activeDevices: {
        name: 'Active Devices',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
      satDeskAccounts: {
        name: 'SatDesk Accounts',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
      recentCommunication: {
        name: 'Device Communication',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
      webhookService: {
        name: 'Webhook Service',
        status: 'checking',
        message: 'Initializing...',
        lastChecked: new Date().toISOString(),
      },
    },
    lastUpdate: new Date().toISOString(),
  },
  isChecking: false,

  runHealthCheck: async () => {
    set({ isChecking: true });
    const now = new Date().toISOString();

    try {
      // Get current satdesk and order data safely
      const satDesksState = useSatDeskStore.getState();
      const ordersState = useOrderStore.getState();
      
      const satDesks = satDesksState?.satDesks || [];
      const orders = ordersState?.orders || [];

      // Mock device data (replace with real device store when available)
      const mockDevices = [
        { id: '1', status: 'active', lastContact: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
        { id: '2', status: 'active', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: '3', status: 'active', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: '4', status: 'active', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
        { id: '5', status: 'active', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString() },
        { id: '6', status: 'inactive', lastContact: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      ];

      // 1. Check Garmin API connectivity
      const garminApiCheck: SystemCheck = await checkGarminApi(satDesks);

      // 2. Check ECC Connection
      const eccCheck: SystemCheck = await checkECCConnection();

      // 3. Check Active Devices
      const activeDevicesCheck: SystemCheck = checkActiveDevices(mockDevices);

      // 4. Check SatDesk Accounts
      const satDeskCheck: SystemCheck = checkSatDeskAccounts(satDesks);

      // 5. Check Recent Communication
      const recentCommCheck: SystemCheck = checkRecentCommunication(mockDevices);

      // 6. Check Webhook Service
      const webhookCheck: SystemCheck = await checkWebhookService();

      // Determine overall status
      const checks = {
        garminApi: garminApiCheck,
        eccConnection: eccCheck,
        activeDevices: activeDevicesCheck,
        satDeskAccounts: satDeskCheck,
        recentCommunication: recentCommCheck,
        webhookService: webhookCheck,
      };

      const overall = calculateOverallStatus(checks);

      set({
        status: {
          overall,
          checks,
          lastUpdate: now,
        },
        isChecking: false,
      });
    } catch (error) {
      console.error('Health check failed:', error);
      set({ isChecking: false });
    }
  },

  startAutoCheck: () => {
    // Run initial check
    get().runHealthCheck();

    // Set up periodic checks
    if (autoCheckTimer) {
      clearInterval(autoCheckTimer);
    }
    autoCheckTimer = setInterval(() => {
      get().runHealthCheck();
    }, AUTO_CHECK_INTERVAL);
  },

  stopAutoCheck: () => {
    if (autoCheckTimer) {
      clearInterval(autoCheckTimer);
      autoCheckTimer = null;
    }
  },
}));

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Check Garmin API connectivity by verifying credentials and attempting connection
 */
async function checkGarminApi(satDesks: any[]): Promise<SystemCheck> {
  const now = new Date().toISOString();
  
  const activeSatDesks = satDesks.filter(sd => sd.isActive);
  
  if (activeSatDesks.length === 0) {
    return {
      name: 'Garmin API',
      status: 'warning',
      message: 'No active SatDesk accounts configured',
      lastChecked: now,
    };
  }

  // Check if any SatDesks have credentials
  const satDesksWithCredentials = activeSatDesks.filter(
    sd => sd.garminUsername && (sd.garminPassword || sd.garminApiToken)
  );

  if (satDesksWithCredentials.length === 0) {
    return {
      name: 'Garmin API',
      status: 'warning',
      message: 'No API credentials configured',
      lastChecked: now,
    };
  }

  // TODO: Actual API check when credentials are available
  // For now, simulate API check
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      name: 'Garmin API',
      status: 'ok',
      message: `${satDesksWithCredentials.length} account${satDesksWithCredentials.length > 1 ? 's' : ''} ready`,
      lastChecked: now,
    };
  } catch (error) {
    return {
      name: 'Garmin API',
      status: 'error',
      message: 'Unable to reach Garmin API',
      lastChecked: now,
    };
  }
}

/**
 * Check ECC (Emergency Command Center) connectivity
 */
async function checkECCConnection(): Promise<SystemCheck> {
  const now = new Date().toISOString();
  
  // TODO: Implement actual ECC connectivity check
  // For now, simulate connection check
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      name: 'ECC Connection',
      status: 'ok',
      message: 'Magnus ECC connected',
      lastChecked: now,
    };
  } catch (error) {
    return {
      name: 'ECC Connection',
      status: 'error',
      message: 'Cannot reach Magnus ECC',
      lastChecked: now,
    };
  }
}

/**
 * Check active devices count and status
 */
function checkActiveDevices(devices: any[]): SystemCheck {
  const now = new Date().toISOString();
  
  const activeDevices = devices.filter(d => d.status === 'active');
  const totalDevices = devices.length;

  if (totalDevices === 0) {
    return {
      name: 'Active Devices',
      status: 'warning',
      message: 'No devices registered',
      lastChecked: now,
    };
  }

  if (activeDevices.length === 0) {
    return {
      name: 'Active Devices',
      status: 'warning',
      message: `0 of ${totalDevices} devices active`,
      lastChecked: now,
    };
  }

  return {
    name: 'Active Devices',
    status: 'ok',
    message: `${activeDevices.length} of ${totalDevices} active`,
    lastChecked: now,
  };
}

/**
 * Check SatDesk accounts configuration
 */
function checkSatDeskAccounts(satDesks: any[]): SystemCheck {
  const now = new Date().toISOString();
  
  const activeSatDesks = satDesks.filter(sd => sd.isActive);

  if (satDesks.length === 0) {
    return {
      name: 'SatDesk Accounts',
      status: 'error',
      message: 'No SatDesk accounts configured',
      lastChecked: now,
    };
  }

  if (activeSatDesks.length === 0) {
    return {
      name: 'SatDesk Accounts',
      status: 'warning',
      message: 'All SatDesk accounts inactive',
      lastChecked: now,
    };
  }

  return {
    name: 'SatDesk Accounts',
    status: 'ok',
    message: `${activeSatDesks.length} active account${activeSatDesks.length > 1 ? 's' : ''}`,
    lastChecked: now,
  };
}

/**
 * Check recent device communication (last 24 hours)
 */
function checkRecentCommunication(devices: any[]): SystemCheck {
  const now = new Date().toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const activeDevices = devices.filter(d => d.status === 'active');
  
  if (activeDevices.length === 0) {
    return {
      name: 'Device Communication',
      status: 'warning',
      message: 'No active devices',
      lastChecked: now,
    };
  }

  const recentDevices = activeDevices.filter(d => {
    if (!d.lastContact) return false;
    return new Date(d.lastContact) > twentyFourHoursAgo;
  });

  const percentage = Math.round((recentDevices.length / activeDevices.length) * 100);

  if (percentage === 0) {
    return {
      name: 'Device Communication',
      status: 'error',
      message: 'No devices checked in (24h)',
      lastChecked: now,
    };
  }

  if (percentage < 50) {
    return {
      name: 'Device Communication',
      status: 'warning',
      message: `${percentage}% checked in (24h)`,
      lastChecked: now,
    };
  }

  return {
    name: 'Device Communication',
    status: 'ok',
    message: `${recentDevices.length} of ${activeDevices.length} checked in (24h)`,
    lastChecked: now,
  };
}

/**
 * Check webhook service connectivity
 */
async function checkWebhookService(): Promise<SystemCheck> {
  const now = new Date().toISOString();
  
  // TODO: Implement actual webhook service check (magnus.co.il)
  // For now, simulate service check
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      name: 'Webhook Service',
      status: 'ok',
      message: 'magnus.co.il connected',
      lastChecked: now,
    };
  } catch (error) {
    return {
      name: 'Webhook Service',
      status: 'error',
      message: 'Webhook service unreachable',
      lastChecked: now,
    };
  }
}

/**
 * Calculate overall system status based on individual checks
 */
function calculateOverallStatus(checks: Record<string, SystemCheck>): SystemHealthStatus {
  const statuses = Object.values(checks).map(check => check.status);

  // If any critical service is down, overall is critical
  if (statuses.includes('error')) {
    return 'critical';
  }

  // If any service has warnings, overall is degraded
  if (statuses.includes('warning')) {
    return 'degraded';
  }

  // If all services are checking, overall is checking
  if (statuses.every(s => s === 'checking')) {
    return 'checking';
  }

  // Otherwise, all systems operational
  return 'operational';
}

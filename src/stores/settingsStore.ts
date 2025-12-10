import { create } from 'zustand';

export interface GarminAPIConfig {
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface ECCConfig {
  apiUrl: string;
  apiKey: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface EcommerceConfig {
  websiteUrl: string;
  webhookSecret: string;
  portalUrl: string;
  autoCreateRentals: boolean;
  isConnected: boolean;
}

export interface NotificationSettings {
  rentalExpirationDays: number;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  adminEmail: string;
}

export interface DataRetentionSettings {
  archiveAfterDays: number;
  purgeAfterDays: number;
  enableAutoArchive: boolean;
  enableAutoPurge: boolean;
}

interface SettingsStore {
  garminAPI: GarminAPIConfig;
  eccAPI: ECCConfig;
  ecommerceAPI: EcommerceConfig;
  notifications: NotificationSettings;
  dataRetention: DataRetentionSettings;
  updateGarminAPI: (config: Partial<GarminAPIConfig>) => void;
  updateECCAPI: (config: Partial<ECCConfig>) => void;
  updateEcommerceAPI: (config: Partial<EcommerceConfig>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateDataRetention: (settings: Partial<DataRetentionSettings>) => void;
  testGarminConnection: () => Promise<boolean>;
  testECCConnection: () => Promise<boolean>;
  testEcommerceConnection: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  garminAPI: {
    apiKey: '',
    apiSecret: '',
    webhookUrl: 'https://your-app.com/api/webhooks/garmin',
    isConnected: false,
    lastSync: undefined,
  },
  eccAPI: {
    apiUrl: 'https://ecc.magnus.com/api',
    apiKey: '',
    isConnected: false,
    lastSync: undefined,
  },
  ecommerceAPI: {
    websiteUrl: 'https://ecommerce.magnus.com',
    webhookSecret: '',
    portalUrl: 'https://portal.magnus.com',
    autoCreateRentals: true,
    isConnected: false,
  },
  notifications: {
    rentalExpirationDays: 7,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    adminEmail: 'admin@magnus.com',
  },
  dataRetention: {
    archiveAfterDays: 30,
    purgeAfterDays: 365,
    enableAutoArchive: true,
    enableAutoPurge: false,
  },
  updateGarminAPI: (config) =>
    set((state) => ({
      garminAPI: { ...state.garminAPI, ...config },
    })),
  updateECCAPI: (config) =>
    set((state) => ({
      eccAPI: { ...state.eccAPI, ...config },
    })),
  updateEcommerceAPI: (config) =>
    set((state) => ({
      ecommerceAPI: { ...state.ecommerceAPI, ...config },
    })),
  updateNotifications: (settings) =>
    set((state) => ({
      notifications: { ...state.notifications, ...settings },
    })),
  updateDataRetention: (settings) =>
    set((state) => ({
      dataRetention: { ...state.dataRetention, ...settings },
    })),
  testGarminConnection: async () => {
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isConnected = get().garminAPI.apiKey.length > 0;
    set((state) => ({
      garminAPI: {
        ...state.garminAPI,
        isConnected,
        lastSync: isConnected ? new Date().toISOString() : undefined,
      },
    }));
    return isConnected;
  },
  testECCConnection: async () => {
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isConnected = get().eccAPI.apiKey.length > 0;
    set((state) => ({
      eccAPI: {
        ...state.eccAPI,
        isConnected,
        lastSync: isConnected ? new Date().toISOString() : undefined,
      },
    }));
    return isConnected;
  },
  testEcommerceConnection: async () => {
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isConnected = get().ecommerceAPI.webhookSecret.length > 0;
    set((state) => ({
      ecommerceAPI: {
        ...state.ecommerceAPI,
        isConnected,
        lastSync: isConnected ? new Date().toISOString() : undefined,
      },
    }));
    return isConnected;
  },
}));
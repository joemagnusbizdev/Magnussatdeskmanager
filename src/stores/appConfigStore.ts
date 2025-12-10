/**
 * App Configuration Store
 * Manages global app settings including API mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppConfigStore {
  // API Mode
  useMockData: boolean;
  apiConnected: boolean;
  apiUrl: string;
  apiKey: string;
  
  // Feature Flags (from backend)
  featureFlags: Record<string, boolean>;
  
  // Actions
  setUseMockData: (useMock: boolean) => void;
  setApiConnected: (connected: boolean) => void;
  setApiCredentials: (url: string, key: string) => void;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
  
  // Helpers
  isFeatureEnabled: (flagName: string) => boolean;
}

export const useAppConfigStore = create<AppConfigStore>()(
  persist(
    (set, get) => ({
      // Default to mock mode until API is configured
      useMockData: !(import.meta.env?.VITE_API_KEY),
      apiConnected: false,
      apiUrl: import.meta.env?.VITE_API_BASE_URL || 'https://magnus-garmin-ecc.onrender.com',
      apiKey: import.meta.env?.VITE_API_KEY || '',
      featureFlags: {},

      setUseMockData: (useMock) => set({ useMockData: useMock }),
      
      setApiConnected: (connected) => set({ apiConnected: connected }),
      
      setApiCredentials: (url, key) => set({ 
        apiUrl: url, 
        apiKey: key,
        useMockData: !key, // Auto-disable mock mode if API key provided
      }),
      
      setFeatureFlags: (flags) => set({ featureFlags: flags }),
      
      isFeatureEnabled: (flagName) => {
        return get().featureFlags[flagName] || false;
      },
    }),
    {
      name: 'app-config-storage',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        apiKey: state.apiKey,
        useMockData: state.useMockData,
      }),
    }
  )
);
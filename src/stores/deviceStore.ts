/**
 * Device Store
 * Manages device data with support for both mock and real API
 */

import { create } from 'zustand';
import { Device } from '@/types/device';
import { useAppConfigStore } from './appConfigStore';
import * as deviceApi from '@/services/api/devices';
import { toast } from 'sonner@2.0.3';

// Mock data for development/testing
const mockDevices: Device[] = [
  {
    id: '1',
    imei: '300434063679420',
    deviceNumber: 1,
    deviceName: 'inReach Mini 2 - Alpha',
    status: 'active',
    location: 'out',
    satDeskId: 'desk-1',
    rentalStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    rentalEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    lastContact: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1988-05-15',
      idPassport: '123456789',
      email: 'sarah.j@example.com',
      phone: '+972-54-123-4567',
    },
    presetMessages: [],
    notes: 'Customer requested early activation',
  },
  {
    id: '2',
    imei: '300434063679421',
    deviceNumber: 2,
    deviceName: 'inReach Mini 2 - Beta',
    status: 'active',
    location: 'out',
    satDeskId: 'desk-1',
    rentalStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    rentalEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    lastContact: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: {
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: '1992-08-22',
      idPassport: '987654321',
      email: 'mchen@example.com',
      phone: '+972-52-987-6543',
    },
    presetMessages: [],
  },
  {
    id: '3',
    imei: '300434063679422',
    deviceNumber: 3,
    deviceName: 'inReach Mini 2 - Gamma',
    status: 'pending',
    location: 'in',
    satDeskId: 'desk-2',
    rentalStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    rentalEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    presetMessages: [],
    notes: 'Scheduled for activation tomorrow',
  },
  {
    id: '4',
    imei: '300434063679423',
    deviceNumber: 4,
    deviceName: 'inReach Mini 2 - Delta',
    status: 'active',
    location: 'out',
    satDeskId: 'desk-1',
    rentalStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    rentalEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    lastContact: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: {
      firstName: 'David',
      lastName: 'Cohen',
      dateOfBirth: '1985-11-03',
      idPassport: '456789123',
      email: 'd.cohen@example.com',
      phone: '+972-50-456-7890',
    },
    presetMessages: [],
  },
  {
    id: '5',
    imei: '300434063679424',
    deviceNumber: 5,
    deviceName: 'inReach Mini 2 - Epsilon',
    status: 'archived',
    location: 'in',
    satDeskId: 'desk-1',
    rentalStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    rentalEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    presetMessages: [],
    notes: 'Returned and cleaned - ready for next rental',
  },
];

interface DeviceStore {
  devices: Device[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDevices: () => Promise<void>;
  getDeviceById: (id: string) => Device | undefined;
  getDeviceByImei: (imei: string) => Promise<Device | undefined>;
  createDevice: (device: Partial<Device>) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  assignDevice: (id: string, rentalId: string) => Promise<void>;
  cleanupDevice: (id: string) => Promise<void>;
  bulkAssignDevices: (deviceIds: string[], rentalId: string) => Promise<void>;
  
  // Filters
  getDevicesByStatus: (status: Device['status']) => Device[];
  getDevicesBySatDesk: (satDeskId: string) => Device[];
  searchDevices: (query: string) => Device[];
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: mockDevices,
  loading: false,
  error: null,

  // Fetch all devices
  fetchDevices: async () => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      // Mock mode - use local data
      set({ devices: mockDevices, loading: false, error: null });
      return;
    }

    // Real API mode
    set({ loading: true, error: null });
    try {
      const devices = await deviceApi.listDevices();
      
      // Transform API response to match our Device type
      const transformedDevices: Device[] = devices.map(apiDevice => ({
        id: apiDevice.id,
        imei: apiDevice.imei,
        deviceNumber: apiDevice.device_number,
        deviceName: `Device ${apiDevice.device_number}`,
        status: apiDevice.status as Device['status'],
        location: apiDevice.location === 'field' ? 'out' : 'in',
        satDeskId: apiDevice.satdesk_id || '',
        rentalStart: apiDevice.activation_date || new Date().toISOString(),
        rentalEnd: apiDevice.deactivation_date || new Date().toISOString(),
        lastContact: apiDevice.last_check_in,
        notes: apiDevice.notes,
        presetMessages: [],
      }));
      
      set({ devices: transformedDevices, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch devices';
      set({ error: message, loading: false });
      toast.error('Failed to load devices', { description: message });
    }
  },

  // Get device by ID
  getDeviceById: (id) => {
    return get().devices.find(d => d.id === id);
  },

  // Get device by IMEI
  getDeviceByImei: async (imei) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      return get().devices.find(d => d.imei === imei);
    }

    try {
      const device = await deviceApi.getDeviceByImei(imei);
      return {
        id: device.id,
        imei: device.imei,
        deviceNumber: device.device_number,
        deviceName: `Device ${device.device_number}`,
        status: device.status as Device['status'],
        location: device.location === 'field' ? 'out' : 'in',
        satDeskId: device.satdesk_id || '',
        rentalStart: device.activation_date || new Date().toISOString(),
        rentalEnd: device.deactivation_date || new Date().toISOString(),
        lastContact: device.last_check_in,
        notes: device.notes,
        presetMessages: [],
      };
    } catch (error) {
      console.error('Failed to fetch device by IMEI:', error);
      return undefined;
    }
  },

  // Create new device
  createDevice: async (deviceData) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      const newDevice: Device = {
        id: `device-${Date.now()}`,
        imei: deviceData.imei || '',
        deviceNumber: deviceData.deviceNumber || 0,
        deviceName: deviceData.deviceName || '',
        status: deviceData.status || 'pending',
        location: deviceData.location || 'in',
        satDeskId: deviceData.satDeskId || '',
        rentalStart: deviceData.rentalStart || new Date().toISOString(),
        rentalEnd: deviceData.rentalEnd || new Date().toISOString(),
        presetMessages: [],
      };
      
      set(state => ({ devices: [...state.devices, newDevice] }));
      toast.success('Device created successfully');
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.createDevice({
        imei: deviceData.imei,
        device_number: deviceData.deviceNumber,
        satdesk_id: deviceData.satDeskId,
        status: deviceData.status,
        notes: deviceData.notes,
      });
      
      await get().fetchDevices(); // Refresh list
      toast.success('Device created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create device';
      toast.error('Failed to create device', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Update device
  updateDevice: async (id, updates) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      set(state => ({
        devices: state.devices.map(d => d.id === id ? { ...d, ...updates } : d),
      }));
      toast.success('Device updated successfully');
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.updateDevice(id, {
        status: updates.status,
        location: updates.location === 'out' ? 'field' : 'inventory',
        notes: updates.notes,
      });
      
      await get().fetchDevices(); // Refresh list
      toast.success('Device updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update device';
      toast.error('Failed to update device', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Delete device
  deleteDevice: async (id) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      set(state => ({
        devices: state.devices.filter(d => d.id !== id),
      }));
      toast.success('Device deleted successfully');
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.deleteDevice(id);
      set(state => ({
        devices: state.devices.filter(d => d.id !== id),
        loading: false,
      }));
      toast.success('Device deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete device';
      toast.error('Failed to delete device', { description: message });
      set({ loading: false });
    }
  },

  // Assign device to rental
  assignDevice: async (id, rentalId) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      set(state => ({
        devices: state.devices.map(d => 
          d.id === id ? { ...d, status: 'active' as Device['status'], location: 'out' as Device['location'] } : d
        ),
      }));
      toast.success('Device assigned successfully');
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.assignDevice(id, rentalId);
      await get().fetchDevices(); // Refresh list
      toast.success('Device assigned successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign device';
      toast.error('Failed to assign device', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Cleanup device
  cleanupDevice: async (id) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      set(state => ({
        devices: state.devices.map(d => 
          d.id === id 
            ? { ...d, status: 'archived' as Device['status'], location: 'in' as Device['location'], user: undefined } 
            : d
        ),
      }));
      toast.success('Device cleaned and archived');
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.cleanupDevice(id);
      await get().fetchDevices(); // Refresh list
      toast.success('Device cleaned and archived');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cleanup device';
      toast.error('Failed to cleanup device', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Bulk assign devices
  bulkAssignDevices: async (deviceIds, rentalId) => {
    const { useMockData } = useAppConfigStore.getState();
    
    if (useMockData) {
      set(state => ({
        devices: state.devices.map(d => 
          deviceIds.includes(d.id) 
            ? { ...d, status: 'active' as Device['status'], location: 'out' as Device['location'] } 
            : d
        ),
      }));
      toast.success(`${deviceIds.length} devices assigned successfully`);
      return;
    }

    set({ loading: true });
    try {
      await deviceApi.bulkAssignDevices(deviceIds, rentalId);
      await get().fetchDevices(); // Refresh list
      toast.success(`${deviceIds.length} devices assigned successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign devices';
      toast.error('Failed to assign devices', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Filter by status
  getDevicesByStatus: (status) => {
    return get().devices.filter(d => d.status === status);
  },

  // Filter by SatDesk
  getDevicesBySatDesk: (satDeskId) => {
    return get().devices.filter(d => d.satDeskId === satDeskId);
  },

  // Search devices
  searchDevices: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().devices.filter(d =>
      d.imei.includes(query) ||
      d.deviceNumber.toString().includes(query) ||
      d.deviceName.toLowerCase().includes(lowerQuery) ||
      d.user?.firstName.toLowerCase().includes(lowerQuery) ||
      d.user?.lastName.toLowerCase().includes(lowerQuery) ||
      d.notes?.toLowerCase().includes(lowerQuery)
    );
  },
}));

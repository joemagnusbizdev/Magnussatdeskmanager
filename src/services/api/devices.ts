/**
 * FRONTEND: Devices API Service
 * Save to: src/services/api/devices.ts
 */

import apiClient from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Device {
  id: string;
  imei: string;
  device_name: string;
  device_type: string;
  sat_desk_name: string;
  sat_desk_email: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  battery_health: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  last_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceStats {
  available: number;
  rented: number;
  maintenance: number;
  retired: number;
  total: number;
  avg_battery_health: number;
}

// ============================================
// API METHODS
// ============================================

/**
 * Get all available devices
 */
export const getAvailableDevices = async (): Promise<Device[]> => {
  try {
    console.log('📡 Fetching available devices from /api/devices...');
    const response = await apiClient.get('/api/devices', {
      params: { available: true }
    });
    console.log('✅ Devices fetched:', response.data);
    return response.data.devices || [];
  } catch (error) {
    console.error('❌ Failed to fetch devices:', error);
    throw error;
  }
};

/**
 * Get devices for specific date range
 */
export const getDevicesForDateRange = async (
  startDate: string,
  endDate: string
): Promise<Device[]> => {
  try {
    console.log('📡 Fetching devices for date range:', { startDate, endDate });
    const response = await apiClient.get('/api/devices', {
      params: {
        available: true,
        start_date: startDate,
        end_date: endDate
      }
    });
    console.log('✅ Available devices fetched:', response.data);
    return response.data.devices || [];
  } catch (error) {
    console.error('❌ Failed to fetch devices for date range:', error);
    throw error;
  }
};

/**
 * Get device by ID
 */
export const getDeviceById = async (id: string): Promise<Device> => {
  try {
    const response = await apiClient.get(`/api/devices/${id}`);
    return response.data.device;
  } catch (error) {
    console.error(`❌ Failed to fetch device ${id}:`, error);
    throw error;
  }
};

/**
 * Get device by IMEI
 */
export const getDeviceByImei = async (imei: string): Promise<Device> => {
  try {
    const response = await apiClient.get(`/api/devices/imei/${imei}`);
    return response.data.device;
  } catch (error) {
    console.error(`❌ Failed to fetch device with IMEI ${imei}:`, error);
    throw error;
  }
};

/**
 * Get device statistics
 */
export const getDeviceStats = async (): Promise<DeviceStats> => {
  try {
    console.log('📡 Fetching device stats...');
    const response = await apiClient.get('/api/devices/stats');
    console.log('✅ Device stats fetched:', response.data);
    return response.data.stats;
  } catch (error) {
    console.error('❌ Failed to fetch device stats:', error);
    throw error;
  }
};

/**
 * Assign device to rental
 */
export const assignDevice = async (
  rentalId: string,
  deviceId: string
): Promise<void> => {
  try {
    console.log('📡 Assigning device:', { rentalId, deviceId });
    await apiClient.post('/api/devices/assign', {
      rental_id: rentalId,
      device_id: deviceId
    });
    console.log('✅ Device assigned successfully');
  } catch (error) {
    console.error('❌ Failed to assign device:', error);
    throw error;
  }
};

/**
 * Return device from rental
 */
export const returnDevice = async (
  assignmentId: string,
  condition: string,
  notes?: string
): Promise<void> => {
  try {
    console.log('📡 Returning device:', { assignmentId, condition });
    await apiClient.post('/api/devices/return', {
      assignment_id: assignmentId,
      condition_at_return: condition,
      damage_notes: notes
    });
    console.log('✅ Device returned successfully');
  } catch (error) {
    console.error('❌ Failed to return device:', error);
    throw error;
  }
};

// Export default object with all methods
export default {
  getAvailableDevices,
  getDevicesForDateRange,
  getDeviceById,
  getDeviceByImei,
  getDeviceStats,
  assignDevice,
  returnDevice
};

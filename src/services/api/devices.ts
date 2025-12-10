/**
 * Device API Service
 * Handles all device-related API calls
 */

import apiClient from './client';

export interface Device {
  id: string;
  imei: string;
  device_number: number;
  serial_number?: string;
  satdesk_id?: string;
  status: 'available' | 'assigned' | 'in_use' | 'maintenance' | 'retired';
  location?: string;
  firmware_version?: string;
  battery_level?: number;
  last_check_in?: string;
  garmin_device_id?: string;
  activation_date?: string;
  deactivation_date?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface DeviceHistory {
  id: string;
  device_id: string;
  action: string;
  performed_by?: string;
  details?: any;
  timestamp: string;
  location_lat?: number;
  location_lon?: number;
  message_content?: string;
}

export interface ListDevicesParams {
  status?: string;
  satdesk_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BulkAssignResult {
  success: boolean;
  assigned: number;
  failed: number;
  errors?: string[];
}

// ============================================
// DEVICE API METHODS
// ============================================

/**
 * Get all devices
 */
export const listDevices = async (params?: ListDevicesParams): Promise<Device[]> => {
  const response = await apiClient.get('/api/inreach/devices', { params });
  return response.data;
};

/**
 * Get device by ID
 */
export const getDeviceById = async (id: string): Promise<Device> => {
  const response = await apiClient.get(`/api/inreach/devices/${id}`);
  return response.data;
};

/**
 * Get device by IMEI
 */
export const getDeviceByImei = async (imei: string): Promise<Device> => {
  const response = await apiClient.get(`/api/inreach/devices/imei/${imei}`);
  return response.data;
};

/**
 * Create new device
 */
export const createDevice = async (deviceData: Partial<Device>): Promise<Device> => {
  const response = await apiClient.post('/api/inreach/devices', deviceData);
  return response.data;
};

/**
 * Update device
 */
export const updateDevice = async (id: string, deviceData: Partial<Device>): Promise<Device> => {
  const response = await apiClient.put(`/api/inreach/devices/${id}`, deviceData);
  return response.data;
};

/**
 * Delete device
 */
export const deleteDevice = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/devices/${id}`);
};

/**
 * Activate device
 */
export const activateDevice = async (id: string): Promise<Device> => {
  const response = await apiClient.post(`/api/inreach/devices/${id}/activate`);
  return response.data;
};

/**
 * Assign device to rental
 */
export const assignDevice = async (id: string, rentalId: string): Promise<Device> => {
  const response = await apiClient.post(`/api/inreach/devices/${id}/assign`, {
    rental_id: rentalId,
  });
  return response.data;
};

/**
 * Cleanup device (archive and reset)
 */
export const cleanupDevice = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/api/inreach/devices/${id}/cleanup`);
  return response.data;
};

/**
 * Get device history
 */
export const getDeviceHistory = async (id: string): Promise<DeviceHistory[]> => {
  const response = await apiClient.get(`/api/inreach/devices/${id}/history`);
  return response.data;
};

/**
 * Bulk assign devices
 */
export const bulkAssignDevices = async (
  deviceIds: string[],
  rentalId: string
): Promise<BulkAssignResult> => {
  const response = await apiClient.post('/api/inreach/devices/bulk-assign', {
    device_ids: deviceIds,
    rental_id: rentalId,
  });
  return response.data;
};

/**
 * Bulk cleanup devices
 */
export const bulkCleanupDevices = async (deviceIds: string[]): Promise<BulkAssignResult> => {
  const response = await apiClient.post('/api/inreach/devices/bulk-cleanup', {
    device_ids: deviceIds,
  });
  return response.data;
};

/**
 * Get device statistics
 */
export const getDeviceStats = async () => {
  const response = await apiClient.get('/api/inreach/devices/stats');
  return response.data;
};

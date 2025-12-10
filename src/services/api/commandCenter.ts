/**
 * Command Center API Integration
 * Syncs device and user data with your Command Center deployment
 */

import apiClient from './client';

// Command Center API Configuration
const COMMAND_CENTER_URL = import.meta.env?.VITE_COMMAND_CENTER_URL || 'https://your-command-center.onrender.com';

export interface CommandCenterDevice {
  imei: string;
  device_number: number;
  device_name: string;
  status: 'active' | 'inactive';
  user_info?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth?: string;
    id_passport?: string;
    emergency_contacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
  rental_info?: {
    start_date: string;
    end_date: string;
    notes?: string;
  };
  preset_messages?: Array<{
    slot: number;
    message: string;
  }>;
  garmin_login?: string;
  satdesk_id?: string;
}

export interface CommandCenterSyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors?: string[];
}

// ============================================
// COMMAND CENTER SYNC METHODS
// ============================================

/**
 * Sync a single device to Command Center
 */
export const syncDeviceToCommandCenter = async (
  device: CommandCenterDevice
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `${COMMAND_CENTER_URL}/api/devices/sync`,
      device
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to sync device:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to sync device to Command Center'
    };
  }
};

/**
 * Bulk sync devices to Command Center
 */
export const bulkSyncToCommandCenter = async (
  devices: CommandCenterDevice[]
): Promise<CommandCenterSyncResult> => {
  try {
    const response = await apiClient.post(
      `${COMMAND_CENTER_URL}/api/devices/bulk-sync`,
      { devices }
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to bulk sync:', error);
    return {
      success: false,
      synced_count: 0,
      failed_count: devices.length,
      errors: [error.response?.data?.message || 'Bulk sync failed']
    };
  }
};

/**
 * Update user information in Command Center
 */
export const updateUserInCommandCenter = async (
  imei: string,
  userInfo: CommandCenterDevice['user_info']
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.put(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/user`,
      { user_info: userInfo }
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to update user:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user in Command Center'
    };
  }
};

/**
 * Deactivate device in Command Center (when rental ends)
 */
export const deactivateDeviceInCommandCenter = async (
  imei: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/deactivate`
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to deactivate device:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to deactivate device in Command Center'
    };
  }
};

/**
 * Activate device in Command Center (when rental starts)
 */
export const activateDeviceInCommandCenter = async (
  imei: string,
  device: CommandCenterDevice
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/activate`,
      device
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to activate device:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to activate device in Command Center'
    };
  }
};

/**
 * Get device status from Command Center
 */
export const getDeviceStatusFromCommandCenter = async (
  imei: string
): Promise<{
  success: boolean;
  status?: 'active' | 'inactive';
  last_message?: {
    timestamp: string;
    type: string;
    content?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}> => {
  try {
    const response = await apiClient.get(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/status`
    );
    return { success: true, ...response.data };
  } catch (error: any) {
    console.error('[Command Center] Failed to get device status:', error);
    return { success: false };
  }
};

/**
 * Get SOS alerts from Command Center
 */
export const getSOSAlertsFromCommandCenter = async (): Promise<{
  success: boolean;
  alerts?: Array<{
    imei: string;
    device_name: string;
    user_name: string;
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    status: 'active' | 'acknowledged' | 'resolved';
  }>;
}> => {
  try {
    const response = await apiClient.get(
      `${COMMAND_CENTER_URL}/api/alerts/sos`
    );
    return { success: true, alerts: response.data };
  } catch (error: any) {
    console.error('[Command Center] Failed to get SOS alerts:', error);
    return { success: false, alerts: [] };
  }
};

/**
 * Update preset messages in Command Center
 */
export const updatePresetMessagesInCommandCenter = async (
  imei: string,
  presetMessages: Array<{ slot: number; message: string }>
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.put(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/preset-messages`,
      { preset_messages: presetMessages }
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to update preset messages:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update preset messages'
    };
  }
};

/**
 * Check Command Center health
 */
export const checkCommandCenterHealth = async (): Promise<{
  success: boolean;
  status?: 'online' | 'offline';
  version?: string;
  garmin_connected?: boolean;
}> => {
  try {
    const response = await apiClient.get(
      `${COMMAND_CENTER_URL}/health`
    );
    return { success: true, ...response.data };
  } catch (error: any) {
    console.error('[Command Center] Health check failed:', error);
    return { success: false, status: 'offline' };
  }
};

/**
 * Get message history from Command Center
 */
export const getMessageHistoryFromCommandCenter = async (
  imei: string,
  limit: number = 50
): Promise<{
  success: boolean;
  messages?: Array<{
    timestamp: string;
    type: 'sent' | 'received';
    content: string;
    status: 'delivered' | 'pending' | 'failed';
  }>;
}> => {
  try {
    const response = await apiClient.get(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/messages`,
      { params: { limit } }
    );
    return { success: true, messages: response.data };
  } catch (error: any) {
    console.error('[Command Center] Failed to get message history:', error);
    return { success: false, messages: [] };
  }
};

/**
 * Send test message through Command Center
 */
export const sendTestMessage = async (
  imei: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      `${COMMAND_CENTER_URL}/api/devices/${imei}/send-message`,
      { message }
    );
    return response.data;
  } catch (error: any) {
    console.error('[Command Center] Failed to send test message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send test message'
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform device data for Command Center format
 */
export const transformDeviceForCommandCenter = (device: any): CommandCenterDevice => {
  return {
    imei: device.imei,
    device_number: device.deviceNumber,
    device_name: device.deviceName,
    status: device.status === 'active' ? 'active' : 'inactive',
    user_info: device.user ? {
      first_name: device.user.firstName,
      last_name: device.user.lastName,
      email: device.user.email,
      phone: device.user.phone,
      date_of_birth: device.user.dateOfBirth,
      id_passport: device.user.idPassport,
      emergency_contacts: device.user.emergencyContacts?.map((contact: any) => ({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship
      }))
    } : undefined,
    rental_info: device.rentalStart ? {
      start_date: device.rentalStart,
      end_date: device.rentalEnd,
      notes: device.notes
    } : undefined,
    preset_messages: device.presetMessages?.map((pm: any) => ({
      slot: pm.slot,
      message: pm.message
    })),
    garmin_login: device.garminLogin,
    satdesk_id: device.satDeskId
  };
};

/**
 * SatDesks API Service
 * Handles all SatDesk (Garmin account) related API calls
 */

import apiClient from './client';

export interface SatDesk {
  id: string;
  name: string;
  garmin_username: string;
  garmin_password_encrypted: string;
  encryption_key_id?: string;
  device_limit: number;
  api_credentials?: Record<string, any>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
}

export interface PresetMessage {
  id: string;
  satdesk_id: string;
  message_text: string;
  message_type: 'standard' | 'quick_text' | 'check_in';
  is_default: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// SATDESK API METHODS
// ============================================

/**
 * Get all SatDesks
 */
export const listSatDesks = async (): Promise<SatDesk[]> => {
  const response = await apiClient.get('/api/inreach/satdesks');
  return response.data;
};

/**
 * Get SatDesk by ID
 */
export const getSatDeskById = async (id: string): Promise<SatDesk> => {
  const response = await apiClient.get(`/api/inreach/satdesks/${id}`);
  return response.data;
};

/**
 * Create new SatDesk
 */
export const createSatDesk = async (satdeskData: Partial<SatDesk>): Promise<SatDesk> => {
  const response = await apiClient.post('/api/inreach/satdesks', satdeskData);
  return response.data;
};

/**
 * Update SatDesk
 */
export const updateSatDesk = async (id: string, satdeskData: Partial<SatDesk>): Promise<SatDesk> => {
  const response = await apiClient.put(`/api/inreach/satdesks/${id}`, satdeskData);
  return response.data;
};

/**
 * Delete SatDesk
 */
export const deleteSatDesk = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/satdesks/${id}`);
};

/**
 * Get devices for SatDesk
 */
export const getSatDeskDevices = async (id: string) => {
  const response = await apiClient.get(`/api/inreach/satdesks/${id}/devices`);
  return response.data;
};

/**
 * Test Garmin login credentials
 */
export const testGarminLogin = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/api/inreach/satdesks/${id}/test-login`);
  return response.data;
};

// ============================================
// PRESET MESSAGES API METHODS
// ============================================

/**
 * Get preset messages for SatDesk
 */
export const getPresetMessages = async (satdeskId: string): Promise<PresetMessage[]> => {
  const response = await apiClient.get(`/api/inreach/satdesks/${satdeskId}/preset-messages`);
  return response.data;
};

/**
 * Create preset message
 */
export const createPresetMessage = async (
  satdeskId: string,
  messageData: Partial<PresetMessage>
): Promise<PresetMessage> => {
  const response = await apiClient.post(
    `/api/inreach/satdesks/${satdeskId}/preset-messages`,
    messageData
  );
  return response.data;
};

/**
 * Update preset message
 */
export const updatePresetMessage = async (
  satdeskId: string,
  messageId: string,
  messageData: Partial<PresetMessage>
): Promise<PresetMessage> => {
  const response = await apiClient.put(
    `/api/inreach/satdesks/${satdeskId}/preset-messages/${messageId}`,
    messageData
  );
  return response.data;
};

/**
 * Delete preset message
 */
export const deletePresetMessage = async (satdeskId: string, messageId: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/satdesks/${satdeskId}/preset-messages/${messageId}`);
};

/**
 * Reorder preset messages
 */
export const reorderPresetMessages = async (
  satdeskId: string,
  messageIds: string[]
): Promise<void> => {
  await apiClient.post(`/api/inreach/satdesks/${satdeskId}/preset-messages/reorder`, {
    message_ids: messageIds,
  });
};

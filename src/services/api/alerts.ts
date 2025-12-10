/**
 * Alerts API Service
 * Handles all alert/notification related API calls
 */

import apiClient from './client';

export interface Alert {
  id: string;
  alert_type: 'rental_expiring' | 'rental_expired' | 'low_inventory' | 'device_offline';
  severity: 'info' | 'warning' | 'critical';
  entity_type?: 'device' | 'rental' | 'inventory';
  entity_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

export interface ListAlertsParams {
  alert_type?: string;
  severity?: string;
  is_read?: boolean;
  is_dismissed?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// ALERT API METHODS
// ============================================

/**
 * Get all alerts
 */
export const listAlerts = async (params?: ListAlertsParams): Promise<Alert[]> => {
  const response = await apiClient.get('/api/inreach/alerts', { params });
  return response.data;
};

/**
 * Get alert by ID
 */
export const getAlertById = async (id: string): Promise<Alert> => {
  const response = await apiClient.get(`/api/inreach/alerts/${id}`);
  return response.data;
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (id: string): Promise<Alert> => {
  const response = await apiClient.post(`/api/inreach/alerts/${id}/read`);
  return response.data;
};

/**
 * Mark alert as dismissed
 */
export const dismissAlert = async (id: string): Promise<Alert> => {
  const response = await apiClient.post(`/api/inreach/alerts/${id}/dismiss`);
  return response.data;
};

/**
 * Mark all alerts as read
 */
export const markAllAlertsAsRead = async (): Promise<void> => {
  await apiClient.post('/api/inreach/alerts/read-all');
};

/**
 * Dismiss all alerts
 */
export const dismissAllAlerts = async (): Promise<void> => {
  await apiClient.post('/api/inreach/alerts/dismiss-all');
};

/**
 * Get unread alerts
 */
export const getUnreadAlerts = async (): Promise<Alert[]> => {
  return listAlerts({ is_read: false, is_dismissed: false });
};

/**
 * Get critical alerts
 */
export const getCriticalAlerts = async (): Promise<Alert[]> => {
  return listAlerts({ severity: 'critical', is_dismissed: false });
};

/**
 * Delete alert
 */
export const deleteAlert = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/alerts/${id}`);
};

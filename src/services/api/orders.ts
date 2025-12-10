/**
 * Orders API Service
 * Handles all order-related API calls (magnus.co.il integration)
 */

import apiClient from './client';

export interface Order {
  id: string;
  order_id: string;
  customer_email?: string;
  customer_name?: string;
  product_sku?: string;
  product_name?: string;
  quantity: number;
  rental_start?: string;
  rental_end?: string;
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled';
  order_total?: number;
  webhook_payload?: Record<string, any>;
  processed_at?: string;
  rental_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ListOrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

// ============================================
// ORDER API METHODS
// ============================================

/**
 * Get all orders
 */
export const listOrders = async (params?: ListOrdersParams): Promise<Order[]> => {
  const response = await apiClient.get('/api/inreach/orders', { params });
  return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`/api/inreach/orders/${id}`);
  return response.data;
};

/**
 * Get order by order ID (from magnus.co.il)
 */
export const getOrderByOrderId = async (orderId: string): Promise<Order> => {
  const response = await apiClient.get(`/api/inreach/orders/order/${orderId}`);
  return response.data;
};

/**
 * Process pending order (assign devices)
 */
export const processOrder = async (id: string): Promise<Order> => {
  const response = await apiClient.post(`/api/inreach/orders/${id}/process`);
  return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (id: string, reason?: string): Promise<Order> => {
  const response = await apiClient.post(`/api/inreach/orders/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Get pending orders (not yet processed)
 */
export const getPendingOrders = async (): Promise<Order[]> => {
  return listOrders({ status: 'pending' });
};

/**
 * Manual order creation (for walk-in customers)
 */
export const createManualOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const response = await apiClient.post('/api/inreach/orders/manual', orderData);
  return response.data;
};

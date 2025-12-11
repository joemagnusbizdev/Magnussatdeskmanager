/**
 * Orders API Service
 * FIXED: Updated to use correct backend endpoints
 */

import apiClient from './client';

// ============================================
// TYPE DEFINITIONS (Match Backend Schema)
// ============================================

export interface Order {
  id: string;
  woocommerce_order_id: string;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  billing_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    total: string;
    sku?: string;
  }>;
  order_total: string;
  order_currency: string;
  rental_start_date?: string;
  rental_end_date?: string;
  trip_destination?: string;
  created_at: string;
  updated_at: string;
  raw_webhook_data?: Record<string, any>;
}

export interface OrderStats {
  total: number;
  new: number;
  processing: number;
  completed: number;
  cancelled: number;
  last24Hours: number;
  last7Days: number;
}

// ============================================
// ORDER API METHODS - CORRECTED ENDPOINTS!
// ============================================

/**
 * Get all orders from backend
 */
export const listOrders = async (): Promise<Order[]> => {
  try {
    console.log('📡 Fetching orders from /api/webhooks/orders...');
    const response = await apiClient.get('/api/webhooks/orders');
    console.log('✅ Orders fetched:', response.data);
    return response.data.orders || [];
  } catch (error) {
    console.error('❌ Failed to fetch orders:', error);
    throw error;
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    console.log('📡 Fetching order stats from /api/webhooks/stats...');
    const response = await apiClient.get('/api/webhooks/stats');
    console.log('✅ Stats fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await apiClient.get(`/api/webhooks/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch order ${id}:`, error);
    throw error;
  }
};

/**
 * Get pending orders (status = 'new')
 */
export const getPendingOrders = async (): Promise<Order[]> => {
  try {
    const orders = await listOrders();
    return orders.filter(order => order.status === 'new');
  } catch (error) {
    console.error('❌ Failed to fetch pending orders:', error);
    throw error;
  }
};

/**
 * Get recent orders (last 24 hours)
 */
export const getRecentOrders = async (): Promise<Order[]> => {
  try {
    const orders = await listOrders();
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= oneDayAgo;
    });
  } catch (error) {
    console.error('❌ Failed to fetch recent orders:', error);
    throw error;
  }
};

/**
 * Test webhook endpoint connectivity
 */
export const testWebhookConnection = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/api/webhooks/test');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    return false;
  }
};

// Export default object with all methods
export default {
  listOrders,
  getOrderStats,
  getOrderById,
  getPendingOrders,
  getRecentOrders,
  testWebhookConnection,
};

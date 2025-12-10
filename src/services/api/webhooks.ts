/**
 * MAGNUS Webhook Handler - WooCommerce Integration
 * 
 * Receives and processes incoming webhooks from WordPress/WooCommerce
 * for automatic customer and order creation.
 * 
 * @module webhooks
 */

import { apiClient } from './client';

// ============================================
// WEBHOOK PAYLOAD INTERFACES
// ============================================

export interface WooCommerceWebhookPayload {
  source: 'woocommerce';
  sourceUrl: string;
  timestamp: string;
  
  order: {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    orderUrl: string;
  };
  
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idPassport?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      street: string;
      houseNumber: string;
      city: string;
      country: string;
      postcode: string;
    };
    invoiceName?: string;
    companyId?: string;
    emergencyContacts?: Array<{
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      relationship: string;
    }>;
  };
  
  rental: {
    startDate: string;
    endDate: string;
    travelDestination?: string;
    deviceCount: number;
    duration?: number; // in days
  };
  
  payment: {
    method: string;
    methodId: string;
    status: 'paid' | 'pending' | 'failed';
    total: number;
    currency: string;
    paidDate?: string;
  };
  
  metadata?: {
    travelInsurance?: string;
    customerLanguage?: string;
    orderNotes?: string;
    internalNotes?: string;
  };
}

export interface ProcessedWebhookOrder {
  id: string;
  orderNumber: string;
  source: 'website';
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idPassport?: string;
    dateOfBirth?: string;
    emergencyContacts?: Array<{
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    }>;
  };
  rental: {
    startDate: string;
    endDate: string;
    duration: number;
    deviceCount: number;
    estimatedAmount: number;
  };
  payment: {
    method: string;
    status: string;
    amount: number;
  };
  rawPayload?: WooCommerceWebhookPayload;
}

// ============================================
// WEBHOOK API FUNCTIONS (FOR FRONTEND)
// ============================================

/**
 * Get all pending website orders from webhooks
 * These appear in the CS Dashboard as "New Website Orders"
 */
export const getWebsiteOrders = async (
  status?: 'new' | 'processing' | 'completed'
): Promise<ProcessedWebhookOrder[]> => {
  const response = await apiClient.get('/api/webhooks/orders', {
    params: { status },
  });
  return response.data;
};

/**
 * Get a specific website order by ID
 */
export const getWebsiteOrder = async (
  orderId: string
): Promise<ProcessedWebhookOrder> => {
  const response = await apiClient.get(`/api/webhooks/orders/${orderId}`);
  return response.data;
};

/**
 * Mark a website order as processed (when CS rep starts working on it)
 */
export const markOrderAsProcessing = async (
  orderId: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.patch(`/api/webhooks/orders/${orderId}`, {
    status: 'processing',
  });
  return response.data;
};

/**
 * Mark a website order as completed (after devices are assigned and activated)
 */
export const markOrderAsCompleted = async (
  orderId: string,
  rentalId?: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.patch(`/api/webhooks/orders/${orderId}`, {
    status: 'completed',
    rentalId,
  });
  return response.data;
};

/**
 * Delete/cancel a website order
 */
export const cancelWebsiteOrder = async (
  orderId: string,
  reason?: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/api/webhooks/orders/${orderId}`, {
    data: { reason },
  });
  return response.data;
};

/**
 * Test webhook endpoint connectivity
 */
export const testWebhookEndpoint = async (): Promise<{
  status: string;
  endpoint: string;
  configured: boolean;
}> => {
  const response = await apiClient.get('/api/webhooks/test');
  return response.data;
};

/**
 * Get webhook statistics
 */
export const getWebhookStats = async (): Promise<{
  total: number;
  new: number;
  processing: number;
  completed: number;
  failed: number;
  last24Hours: number;
  last7Days: number;
}> => {
  const response = await apiClient.get('/api/webhooks/stats');
  return response.data;
};

// ============================================
// WEBHOOK VALIDATION (BACKEND WOULD USE THIS)
// ============================================

/**
 * Validate webhook signature (for backend implementation reference)
 * Frontend doesn't need this, but included for completeness
 */
export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  // This would be implemented in the backend using crypto
  // Frontend includes this for documentation purposes only
  
  // Backend implementation would be:
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;
  
  return true; // Placeholder for frontend
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform WooCommerce payload to internal order format
 * Used by backend, but frontend can use for preview/testing
 */
export const transformWooCommercePayload = (
  payload: WooCommerceWebhookPayload
): ProcessedWebhookOrder => {
  return {
    id: payload.order.orderId,
    orderNumber: payload.order.orderNumber,
    source: 'website',
    status: 'new',
    createdAt: payload.order.orderDate,
    
    customer: {
      firstName: payload.customer.firstName,
      lastName: payload.customer.lastName,
      email: payload.customer.email,
      phone: payload.customer.phone,
      idPassport: payload.customer.idPassport,
      dateOfBirth: payload.customer.dateOfBirth,
      emergencyContacts: payload.customer.emergencyContacts?.map(contact => ({
        name: `${contact.firstName} ${contact.lastName}`,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email,
      })),
    },
    
    rental: {
      startDate: payload.rental.startDate,
      endDate: payload.rental.endDate,
      duration: payload.rental.duration || 0,
      deviceCount: payload.rental.deviceCount,
      estimatedAmount: payload.payment.total,
    },
    
    payment: {
      method: payload.payment.method,
      status: payload.payment.status,
      amount: payload.payment.total,
    },
    
    rawPayload: payload,
  };
};

/**
 * Format order for display in CS Dashboard
 */
export const formatOrderForDisplay = (
  order: ProcessedWebhookOrder
): {
  title: string;
  subtitle: string;
  badges: string[];
  urgency: 'high' | 'medium' | 'low';
} => {
  const daysUntilStart = Math.ceil(
    (new Date(order.rental.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  let urgency: 'high' | 'medium' | 'low' = 'low';
  if (daysUntilStart <= 1) urgency = 'high';
  else if (daysUntilStart <= 3) urgency = 'medium';
  
  const badges: string[] = [
    order.source,
    order.payment.status,
  ];
  
  if (daysUntilStart <= 1) {
    badges.push('urgent');
  }
  
  if (order.rental.deviceCount > 1) {
    badges.push(`${order.rental.deviceCount} devices`);
  }
  
  return {
    title: `${order.customer.firstName} ${order.customer.lastName}`,
    subtitle: `Order #${order.orderNumber} • ${order.rental.deviceCount} device${order.rental.deviceCount > 1 ? 's' : ''} • Starts ${new Date(order.rental.startDate).toLocaleDateString()}`,
    badges,
    urgency,
  };
};

// ============================================
// MOCK DATA (FOR DEVELOPMENT/TESTING)
// ============================================

/**
 * Mock website orders for testing CS Dashboard
 * Remove this once backend is connected
 */
export const MOCK_WEBSITE_ORDERS: ProcessedWebhookOrder[] = [
  {
    id: 'wo_001',
    orderNumber: 'WC-12345',
    source: 'website',
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    customer: {
      firstName: 'David',
      lastName: 'Cohen',
      email: 'david.cohen@example.com',
      phone: '+972-50-123-4567',
      idPassport: '123456789',
      dateOfBirth: '1985-03-15',
      emergencyContacts: [
        {
          name: 'Sarah Cohen',
          relationship: 'Spouse',
          phone: '+972-50-987-6543',
          email: 'sarah.cohen@example.com',
        },
      ],
    },
    rental: {
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // +10 days
      duration: 10,
      deviceCount: 1,
      estimatedAmount: 450,
    },
    payment: {
      method: 'Credit Card',
      status: 'paid',
      amount: 450,
    },
  },
  {
    id: 'wo_002',
    orderNumber: 'WC-12346',
    source: 'website',
    status: 'new',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    customer: {
      firstName: 'Rachel',
      lastName: 'Levy',
      email: 'rachel.levy@example.com',
      phone: '+972-54-234-5678',
      idPassport: '987654321',
      dateOfBirth: '1990-07-22',
      emergencyContacts: [
        {
          name: 'Michael Levy',
          relationship: 'Brother',
          phone: '+972-52-345-6789',
        },
      ],
    },
    rental: {
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // +16 days
      duration: 14,
      deviceCount: 2,
      estimatedAmount: 1200,
    },
    payment: {
      method: 'Credit Card',
      status: 'paid',
      amount: 1200,
    },
  },
];

export default {
  getWebsiteOrders,
  getWebsiteOrder,
  markOrderAsProcessing,
  markOrderAsCompleted,
  cancelWebsiteOrder,
  testWebhookEndpoint,
  getWebhookStats,
  transformWooCommercePayload,
  formatOrderForDisplay,
  MOCK_WEBSITE_ORDERS,
};
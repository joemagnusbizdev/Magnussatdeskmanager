import { create } from 'zustand';

export interface WebhookEvent {
  id: string;
  timestamp: Date;
  source: 'garmin' | 'ecommerce' | 'ecc';
  eventType: string;
  status: 'received' | 'processing' | 'processed' | 'failed';
  payload: any;
  responseStatus?: number;
  responseTime?: number;
  errorMessage?: string;
  retryCount: number;
  processedAt?: Date;
}

interface WebhookStore {
  events: WebhookEvent[];
  addEvent: (event: Omit<WebhookEvent, 'id' | 'timestamp' | 'retryCount'>) => void;
  updateEventStatus: (id: string, status: WebhookEvent['status'], errorMessage?: string) => void;
  retryEvent: (id: string) => void;
  getEvents: (filters?: {
    source?: string;
    status?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
  }) => WebhookEvent[];
  clearEvents: () => void;
}

export const useWebhookStore = create<WebhookStore>((set, get) => ({
  events: [
    {
      id: 'webhook-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      source: 'ecommerce',
      eventType: 'order.created',
      status: 'processed',
      payload: {
        orderId: 'ORD-2024-001',
        customerEmail: 'customer@example.com',
        deviceType: 'inReach Mini 2',
        rentalPeriod: '7 days',
      },
      responseStatus: 200,
      responseTime: 145,
      retryCount: 0,
      processedAt: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
      id: 'webhook-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      source: 'garmin',
      eventType: 'device.location_update',
      status: 'processed',
      payload: {
        imei: '300434063679420',
        latitude: 32.0853,
        longitude: 34.7818,
        timestamp: new Date().toISOString(),
      },
      responseStatus: 200,
      responseTime: 89,
      retryCount: 0,
      processedAt: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: 'webhook-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      source: 'garmin',
      eventType: 'device.message_received',
      status: 'processed',
      payload: {
        imei: '300434063679421',
        message: 'All good, setting up camp',
        timestamp: new Date().toISOString(),
      },
      responseStatus: 200,
      responseTime: 112,
      retryCount: 0,
      processedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: 'webhook-4',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      source: 'ecommerce',
      eventType: 'order.completed',
      status: 'failed',
      payload: {
        orderId: 'ORD-2024-002',
      },
      responseStatus: 500,
      errorMessage: 'Database connection timeout',
      retryCount: 2,
    },
    {
      id: 'webhook-5',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      source: 'garmin',
      eventType: 'device.sos_triggered',
      status: 'processed',
      payload: {
        imei: '300434063679422',
        latitude: 31.7683,
        longitude: 35.2137,
        timestamp: new Date().toISOString(),
        emergencyType: 'SOS',
      },
      responseStatus: 200,
      responseTime: 67,
      retryCount: 0,
      processedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ],

  addEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          retryCount: 0,
        },
        ...state.events,
      ],
    })),

  updateEventStatus: (id, status, errorMessage) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              status,
              errorMessage,
              processedAt: status === 'processed' ? new Date() : event.processedAt,
            }
          : event
      ),
    })),

  retryEvent: (id) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              status: 'processing' as const,
              retryCount: event.retryCount + 1,
            }
          : event
      ),
    })),

  getEvents: (filters) => {
    const { events } = get();
    
    if (!filters) return events;

    return events.filter((event) => {
      if (filters.source && event.source !== filters.source) return false;
      if (filters.status && event.status !== filters.status) return false;
      if (filters.eventType && event.eventType !== filters.eventType) return false;
      if (filters.startDate && event.timestamp < filters.startDate) return false;
      if (filters.endDate && event.timestamp > filters.endDate) return false;
      return true;
    });
  },

  clearEvents: () => set({ events: [] }),
}));

import { create } from 'zustand';
import { useAppConfigStore } from './appConfigStore';
import * as orderApi from '@/services/api/orders';
import { toast } from 'sonner@2.0.3';

export interface RentalOrder {
  id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  preferences: {
    tripDestination: string;
    tripDuration: number;
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    needsTraining: boolean;
    presetMessages?: Array<{ slot: number; message: string }>; // Customer can define presets
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  rentalDetails: {
    startDate: string;
    endDate: string;
    deviceType?: string;
    preferredSatDesk?: string;
  };
  status: 'pending' | 'processing' | 'ready-to-ship' | 'shipped' | 'completed' | 'cancelled' | 'escalated';
  source: 'website' | 'portal' | 'manual';
  createdAt: string;
  processedAt?: string;
  assignedDeviceId?: string;
  assignedIMEI?: string;
  shippedAt?: string;
  notes?: string;
  dataComplete: boolean; // Flag for data validation
  missingFields?: string[]; // List of missing required fields
  needsEscalation?: boolean; // Flag for manual review
}

interface OrderStore {
  orders: RentalOrder[];
  unreadOrderCount: number; // Track new unprocessed orders
  addOrder: (order: Omit<RentalOrder, 'id' | 'createdAt' | 'status' | 'dataComplete'>) => void;
  updateOrder: (id: string, updates: Partial<RentalOrder>) => void;
  deleteOrder: (id: string) => void;
  processOrder: (id: string, deviceId: string, imei: string) => void;
  markAsReadyToShip: (id: string) => void;
  markAsShipped: (id: string) => void;
  escalateOrder: (id: string, reason: string) => void;
  validateOrderData: (order: RentalOrder) => { isComplete: boolean; missingFields: string[] };
  markOrderAsRead: (id: string) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [
    {
      id: 'order-1',
      orderNumber: 'MAG-2024-001',
      customerInfo: {
        firstName: 'Sarah',
        lastName: 'Thompson',
        email: 'sarah.t@example.com',
        phone: '+1 (555) 987-6543',
      },
      preferences: {
        tripDestination: 'Denali National Park, Alaska',
        tripDuration: 14,
        experienceLevel: 'intermediate',
        needsTraining: false,
        presetMessages: [
          { slot: 1, message: 'All good, continuing as planned' },
          { slot: 2, message: 'Setting up camp for the night' },
          { slot: 3, message: 'Emergency - need assistance' },
        ],
        emergencyContact: {
          name: 'Mike Thompson',
          phone: '+1 (555) 987-6544',
          relationship: 'Husband',
        },
      },
      rentalDetails: {
        startDate: '2024-12-10',
        endDate: '2024-12-24',
        deviceType: 'inReach Mini 2',
        preferredSatDesk: 'sd-1',
      },
      status: 'pending',
      source: 'website',
      createdAt: '2024-12-04T09:30:00Z',
      notes: 'Customer purchased premium insurance package',
      dataComplete: true,
      missingFields: [],
    },
    {
      id: 'order-2',
      orderNumber: 'MAG-2024-002',
      customerInfo: {
        firstName: 'James',
        lastName: 'Rodriguez',
        email: 'james.r@example.com',
        phone: '', // Missing phone!
      },
      preferences: {
        tripDestination: 'Patagonia, Chile',
        tripDuration: 21,
        experienceLevel: 'expert',
        needsTraining: false,
        // Missing emergency contact and preset messages
      },
      rentalDetails: {
        startDate: '2024-12-08',
        endDate: '2024-12-29',
        deviceType: 'inReach Messenger',
        preferredSatDesk: 'sd-2',
      },
      status: 'pending',
      source: 'website',
      createdAt: '2024-12-03T14:20:00Z',
      dataComplete: false,
      missingFields: ['phone', 'emergencyContact', 'presetMessages'],
      needsEscalation: true,
    },
  ],
  unreadOrderCount: 2,
  addOrder: (order) => {
    const validation = get().validateOrderData(order as RentalOrder);
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: `order-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending' as const,
          dataComplete: validation.isComplete,
          missingFields: validation.missingFields,
          needsEscalation: !validation.isComplete,
        },
      ],
      unreadOrderCount: state.unreadOrderCount + 1,
    }));
  },
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...updates };
          const validation = get().validateOrderData(updated);
          return {
            ...updated,
            dataComplete: validation.isComplete,
            missingFields: validation.missingFields,
            needsEscalation: updates.needsEscalation ?? (!validation.isComplete),
          };
        }
        return o;
      }),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
  processOrder: (id, deviceId, imei) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'processing' as const,
              assignedDeviceId: deviceId,
              assignedIMEI: imei,
              processedAt: new Date().toISOString(),
            }
          : o
      ),
    })),
  markAsReadyToShip: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'ready-to-ship' as const,
            }
          : o
      ),
    })),
  markAsShipped: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'shipped' as const,
              shippedAt: new Date().toISOString(),
            }
          : o
      ),
    })),
  escalateOrder: (id, reason) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'escalated' as const,
              needsEscalation: true,
              notes: o.notes ? `${o.notes}\n\nEscalated: ${reason}` : `Escalated: ${reason}`,
            }
          : o
      ),
    })),
  validateOrderData: (order) => {
    const missingFields: string[] = [];
    
    // Required customer info
    if (!order.customerInfo.phone) missingFields.push('phone');
    
    // Required emergency contact
    if (!order.preferences.emergencyContact?.name) missingFields.push('emergencyContact.name');
    if (!order.preferences.emergencyContact?.phone) missingFields.push('emergencyContact.phone');
    
    // Preset messages (at least 1)
    if (!order.preferences.presetMessages || order.preferences.presetMessages.length === 0) {
      missingFields.push('presetMessages');
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  },
  markOrderAsRead: (id) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === id);
      if (order && order.status === 'pending') {
        return {
          unreadOrderCount: Math.max(0, state.unreadOrderCount - 1),
        };
      }
      return state;
    }),
}));
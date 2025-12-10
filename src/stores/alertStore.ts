import { create } from 'zustand';
import { mockDevices } from '@/data/mockDevices';
import { useSatDeskStore } from './satDeskStore';
import { useOrderStore } from './orderStore';
import { useAppConfigStore } from './appConfigStore';
import * as alertApi from '@/services/api/alerts';
import { toast } from 'sonner@2.0.3';

export type AlertType = 'rental-expiring' | 'rental-overdue' | 'low-inventory' | 'order-pending';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  deviceId?: string;
  orderId?: string;
  satDeskId?: string;
  daysUntilDue?: number;
  createdAt: string;
  dismissed: boolean;
}

interface AlertStore {
  alerts: Alert[];
  generateAlerts: () => void;
  dismissAlert: (id: string) => void;
  dismissAllAlerts: () => void;
  getActiveAlerts: () => Alert[];
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],

  generateAlerts: () => {
    const now = new Date();
    const newAlerts: Alert[] = [];

    // 1. Rental Expiration Warnings
    mockDevices.forEach((device) => {
      if (device.status === 'active' && device.rentalEnd) {
        const endDate = new Date(device.rentalEnd);
        const daysUntilDue = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Overdue
        if (daysUntilDue < 0) {
          newAlerts.push({
            id: `overdue-${device.id}`,
            type: 'rental-overdue',
            severity: 'critical',
            title: 'Device Overdue',
            message: `Device #${device.deviceNumber} (${device.user?.firstName} ${device.user?.lastName}) is ${Math.abs(daysUntilDue)} days overdue`,
            deviceId: device.id,
            daysUntilDue,
            createdAt: now.toISOString(),
            dismissed: false,
          });
        }
        // Due in 1 day
        else if (daysUntilDue === 1) {
          newAlerts.push({
            id: `expiring-1day-${device.id}`,
            type: 'rental-expiring',
            severity: 'warning',
            title: 'Device Due Tomorrow',
            message: `Device #${device.deviceNumber} (${device.user?.firstName} ${device.user?.lastName}) is due back tomorrow`,
            deviceId: device.id,
            daysUntilDue,
            createdAt: now.toISOString(),
            dismissed: false,
          });
        }
        // Due in 3 days
        else if (daysUntilDue <= 3) {
          newAlerts.push({
            id: `expiring-3days-${device.id}`,
            type: 'rental-expiring',
            severity: 'info',
            title: 'Device Due Soon',
            message: `Device #${device.deviceNumber} (${device.user?.firstName} ${device.user?.lastName}) is due back in ${daysUntilDue} days`,
            deviceId: device.id,
            daysUntilDue,
            createdAt: now.toISOString(),
            dismissed: false,
          });
        }
      }
    });

    // 2. Low Inventory Alerts (per SatDesk)
    const satDesks = useSatDeskStore.getState().satDesks;
    const inventoryThreshold = 3; // Alert when less than 3 devices available

    satDesks.forEach((satDesk) => {
      const availableDevices = mockDevices.filter(
        (d) => d.satDeskId === satDesk.id && d.location === 'in' && d.status !== 'archived'
      );

      if (availableDevices.length < inventoryThreshold) {
        newAlerts.push({
          id: `low-inventory-${satDesk.id}`,
          type: 'low-inventory',
          severity: availableDevices.length === 0 ? 'critical' : 'warning',
          title: 'Low Inventory',
          message: `${satDesk.name} has only ${availableDevices.length} device${availableDevices.length !== 1 ? 's' : ''} available`,
          satDeskId: satDesk.id,
          createdAt: now.toISOString(),
          dismissed: false,
        });
      }
    });

    // 3. Order Pending Actions
    const orders = useOrderStore.getState().orders;
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    if (pendingOrders.length > 0) {
      newAlerts.push({
        id: 'pending-orders',
        type: 'order-pending',
        severity: pendingOrders.length > 5 ? 'warning' : 'info',
        title: 'Pending Orders',
        message: `${pendingOrders.length} order${pendingOrders.length !== 1 ? 's' : ''} awaiting processing`,
        createdAt: now.toISOString(),
        dismissed: false,
      });
    }

    set({ alerts: newAlerts });
  },

  dismissAlert: (id: string) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, dismissed: true } : alert
      ),
    })),

  dismissAllAlerts: () =>
    set((state) => ({
      alerts: state.alerts.map((alert) => ({ ...alert, dismissed: true })),
    })),

  getActiveAlerts: () => get().alerts.filter((alert) => !alert.dismissed),
}));
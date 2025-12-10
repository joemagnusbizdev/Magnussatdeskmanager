import { create } from 'zustand';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  category: 'device' | 'rental' | 'satdesk' | 'order' | 'settings' | 'api' | 'system';
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  status: 'success' | 'failed' | 'warning';
  errorMessage?: string;
}

interface AuditLogStore {
  logs: AuditLogEntry[];
  addLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  getLogs: (filters?: {
    category?: string;
    userId?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) => AuditLogEntry[];
  clearLogs: () => void;
}

export const useAuditLogStore = create<AuditLogStore>((set, get) => ({
  logs: [
    // Mock data for demonstration
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      userId: 'admin1',
      userName: 'John Smith',
      action: 'Device Activated',
      category: 'device',
      entityType: 'Device',
      entityId: '300434063679420',
      entityName: 'inReach Mini 2',
      status: 'success',
      metadata: {
        imei: '300434063679420',
        satDeskId: 'satdesk1',
      },
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      userId: 'admin1',
      userName: 'John Smith',
      action: 'Garmin API Connection Test',
      category: 'api',
      entityType: 'API',
      entityId: 'garmin-api',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'admin2',
      userName: 'Sarah Johnson',
      action: 'Preset Message Updated',
      category: 'device',
      entityType: 'Device',
      entityId: '300434063679421',
      entityName: 'inReach Messenger',
      changes: [
        {
          field: 'message',
          oldValue: 'All good',
          newValue: 'Everything is OK',
        },
      ],
      status: 'success',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      userId: 'admin1',
      userName: 'John Smith',
      action: 'Device Cleanup Failed',
      category: 'device',
      entityType: 'Device',
      entityId: '300434063679422',
      entityName: 'inReach Mini',
      status: 'failed',
      errorMessage: 'API connection timeout',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      userId: 'admin2',
      userName: 'Sarah Johnson',
      action: 'Bulk Device Activation',
      category: 'device',
      entityType: 'Bulk Operation',
      entityId: 'bulk-001',
      metadata: {
        deviceCount: 5,
        successCount: 5,
      },
      status: 'success',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      userId: 'admin1',
      userName: 'John Smith',
      action: 'Settings Updated',
      category: 'settings',
      entityType: 'Settings',
      entityId: 'ecc-api',
      entityName: 'ECC API Configuration',
      changes: [
        {
          field: 'apiUrl',
          oldValue: 'https://old-ecc.magnus.com/api',
          newValue: 'https://ecc.magnus.com/api',
        },
      ],
      status: 'success',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      userId: 'system',
      userName: 'System',
      action: 'Webhook Received',
      category: 'api',
      entityType: 'Webhook',
      entityId: 'webhook-001',
      metadata: {
        source: 'magnus.co.il',
        event: 'order.created',
        orderId: 'ORD-2024-001',
      },
      status: 'success',
    },
  ],

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        },
        ...state.logs,
      ],
    })),

  getLogs: (filters) => {
    const { logs } = get();
    
    if (!filters) return logs;

    return logs.filter((log) => {
      if (filters.category && log.category !== filters.category) return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.entityId && log.entityId !== filters.entityId) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      return true;
    });
  },

  clearLogs: () => set({ logs: [] }),
}));

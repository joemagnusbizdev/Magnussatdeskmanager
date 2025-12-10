import { create } from 'zustand';

export interface SaleCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyVAT?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface DeviceSale {
  id: string;
  saleNumber: string;
  customer: SaleCustomer;
  devices: {
    imei: string;
    deviceId?: string;
    serialNumber: string;
    model: string;
  }[];
  satDeskId: string;
  saleDate: string;
  activationDate?: string;
  status: 'pending' | 'activated' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  totalAmount?: number;
  notes?: string;
  garminUsername?: string;
  garminPassword?: string;
  createdAt: string;
  updatedAt: string;
}

interface SalesStore {
  sales: DeviceSale[];
  addSale: (sale: Omit<DeviceSale, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSale: (id: string, updates: Partial<DeviceSale>) => void;
  deleteSale: (id: string) => void;
  getSalesBySatDesk: (satDeskId: string) => DeviceSale[];
  getSalesByStatus: (status: DeviceSale['status']) => DeviceSale[];
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [
    {
      id: 'sale-1',
      saleNumber: 'SALE-2024-001',
      customer: {
        firstName: 'John',
        lastName: 'Williams',
        email: 'j.williams@expeditions.com',
        phone: '+1 (555) 123-4567',
        companyName: 'Arctic Expeditions Inc.',
        companyVAT: 'US123456789',
        billingAddress: {
          street: '123 Mountain Road',
          city: 'Anchorage',
          state: 'AK',
          postalCode: '99501',
          country: 'USA',
        },
      },
      devices: [
        {
          imei: '300434063456789',
          serialNumber: 'GM-ARC-001',
          model: 'inReach Mini 2',
        },
        {
          imei: '300434063456790',
          serialNumber: 'GM-ARC-002',
          model: 'inReach Mini 2',
        },
      ],
      satDeskId: 'sd-1',
      saleDate: '2024-11-15',
      activationDate: '2024-11-16',
      status: 'completed',
      paymentStatus: 'paid',
      totalAmount: 799.98,
      notes: 'Bulk purchase for expedition team',
      garminUsername: 'arcticexp_001',
      createdAt: '2024-11-15T10:00:00Z',
      updatedAt: '2024-11-16T14:30:00Z',
    },
    {
      id: 'sale-2',
      saleNumber: 'SALE-2024-002',
      customer: {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@mountainrescue.org',
        phone: '+56 9 8765 4321',
        companyName: 'Chilean Mountain Rescue',
        billingAddress: {
          street: 'Av. Libertador 456',
          city: 'Santiago',
          state: 'RM',
          postalCode: '8320000',
          country: 'Chile',
        },
      },
      devices: [
        {
          imei: '300434063456791',
          serialNumber: 'GM-CHI-001',
          model: 'inReach Messenger',
        },
      ],
      satDeskId: 'sd-2',
      saleDate: '2024-12-01',
      status: 'activated',
      paymentStatus: 'paid',
      totalAmount: 449.99,
      garminUsername: 'chmr_unit_001',
      createdAt: '2024-12-01T08:00:00Z',
      updatedAt: '2024-12-05T11:20:00Z',
    },
    {
      id: 'sale-3',
      saleNumber: 'SALE-2024-003',
      customer: {
        firstName: 'Raj',
        lastName: 'Patel',
        email: 'raj.patel@himalayaadventures.in',
        phone: '+91 98765 43210',
        companyName: 'Himalaya Adventures',
        billingAddress: {
          street: 'Thamel Street',
          city: 'Kathmandu',
          state: 'Bagmati',
          postalCode: '44600',
          country: 'Nepal',
        },
      },
      devices: [
        {
          imei: '300434063456792',
          serialNumber: 'GM-NEP-001',
          model: 'inReach Mini 2',
        },
        {
          imei: '300434063456793',
          serialNumber: 'GM-NEP-002',
          model: 'inReach Mini 2',
        },
        {
          imei: '300434063456794',
          serialNumber: 'GM-NEP-003',
          model: 'inReach Mini 2',
        },
      ],
      satDeskId: 'sd-3',
      saleDate: '2024-12-05',
      status: 'pending',
      paymentStatus: 'partial',
      totalAmount: 1199.97,
      notes: 'Awaiting final payment before activation',
      createdAt: '2024-12-05T09:30:00Z',
      updatedAt: '2024-12-05T09:30:00Z',
    },
  ],
  addSale: (sale) =>
    set((state) => ({
      sales: [
        ...state.sales,
        {
          ...sale,
          id: `sale-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateSale: (id, updates) =>
    set((state) => ({
      sales: state.sales.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    })),
  deleteSale: (id) =>
    set((state) => ({
      sales: state.sales.filter((s) => s.id !== id),
    })),
  getSalesBySatDesk: (satDeskId) => {
    return get().sales.filter((s) => s.satDeskId === satDeskId);
  },
  getSalesByStatus: (status) => {
    return get().sales.filter((s) => s.status === status);
  },
}));

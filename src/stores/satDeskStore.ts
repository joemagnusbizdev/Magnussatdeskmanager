import { create } from 'zustand';

export interface SatDesk {
  id: string;
  number: number;
  name: string;
  description: string;
  garminAccountId?: string;
  garminUsername?: string;
  garminPassword?: string; // Encrypted in production
  garminApiToken?: string; // OAuth token or API key from Garmin
  deviceQuota: number;
  deviceCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SatDeskStore {
  satDesks: SatDesk[];
  selectedSatDeskId: string | null;
  setSelectedSatDesk: (id: string | null) => void;
  addSatDesk: (satDesk: Omit<SatDesk, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSatDesk: (id: string, updates: Partial<SatDesk>) => void;
  deleteSatDesk: (id: string) => void;
}

export const useSatDeskStore = create<SatDeskStore>((set) => ({
  satDesks: [
    {
      id: 'sd-1',
      number: 1,
      name: 'North Operations',
      description: 'Primary account for Alaska and Arctic operations',
      garminAccountId: 'GM-NORTH-001',
      garminUsername: 'magnus_north',
      garminPassword: 'demo_password_encrypted',
      garminApiToken: undefined,
      deviceQuota: 50,
      deviceCount: 12,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T14:30:00Z',
    },
    {
      id: 'sd-2',
      number: 2,
      name: 'South Operations',
      description: 'Patagonia and South America SAR operations',
      garminAccountId: 'GM-SOUTH-002',
      garminUsername: 'magnus_south',
      garminPassword: 'demo_password_encrypted',
      garminApiToken: undefined,
      deviceQuota: 40,
      deviceCount: 8,
      isActive: true,
      createdAt: '2024-02-20T09:00:00Z',
      updatedAt: '2024-11-28T11:15:00Z',
    },
    {
      id: 'sd-3',
      number: 3,
      name: 'East Operations',
      description: 'Nepal, Himalayas, and Southeast Asia coverage',
      garminAccountId: 'GM-EAST-003',
      garminUsername: 'magnus_east',
      garminPassword: 'demo_password_encrypted',
      garminApiToken: undefined,
      deviceQuota: 35,
      deviceCount: 6,
      isActive: true,
      createdAt: '2024-03-10T08:00:00Z',
      updatedAt: '2024-12-02T16:45:00Z',
    },
  ],
  selectedSatDeskId: null,
  setSelectedSatDesk: (id) => set({ selectedSatDeskId: id }),
  addSatDesk: (satDesk) =>
    set((state) => ({
      satDesks: [
        ...state.satDesks,
        {
          ...satDesk,
          id: `sd-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateSatDesk: (id, updates) =>
    set((state) => ({
      satDesks: state.satDesks.map((sd) =>
        sd.id === id
          ? { ...sd, ...updates, updatedAt: new Date().toISOString() }
          : sd
      ),
    })),
  deleteSatDesk: (id) =>
    set((state) => ({
      satDesks: state.satDesks.filter((sd) => sd.id !== id),
      selectedSatDeskId: state.selectedSatDeskId === id ? null : state.selectedSatDeskId,
    })),
}));
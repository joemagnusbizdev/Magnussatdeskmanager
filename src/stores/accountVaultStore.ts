import { create } from 'zustand';

export interface GarminAccount {
  id: string;
  email: string;
  // Encrypted credentials - in production these would be encrypted
  password: string; // Would be encrypted
  accountType: 'customer' | 'shared' | 'test';
  createdDate: Date;
  lastUsed?: Date;
  associatedDevices: string[]; // IMEIs
  associatedCustomers: string[]; // Customer IDs
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  loginAttempts: number;
  lastLoginSuccess?: Date;
  twoFactorEnabled: boolean;
}

interface AccountVaultStore {
  accounts: GarminAccount[];
  addAccount: (account: Omit<GarminAccount, 'id' | 'createdDate' | 'loginAttempts'>) => void;
  updateAccount: (id: string, updates: Partial<GarminAccount>) => void;
  deleteAccount: (id: string) => void;
  getAccount: (id: string) => GarminAccount | undefined;
  getAccountsByDevice: (imei: string) => GarminAccount[];
  searchAccounts: (query: string) => GarminAccount[];
}

export const useAccountVaultStore = create<AccountVaultStore>((set, get) => ({
  accounts: [
    {
      id: 'acc-1',
      email: 'rental.shared.01@magnus.com',
      password: '••••••••', // Encrypted in production
      accountType: 'shared',
      createdDate: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      associatedDevices: ['300434063679420', '300434063679421'],
      associatedCustomers: ['CUST-001', 'CUST-002'],
      status: 'active',
      notes: 'Shared account for short-term rentals (1-7 days)',
      loginAttempts: 0,
      lastLoginSuccess: new Date(Date.now() - 1000 * 60 * 60 * 2),
      twoFactorEnabled: true,
    },
    {
      id: 'acc-2',
      email: 'rental.shared.02@magnus.com',
      password: '••••••••',
      accountType: 'shared',
      createdDate: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      associatedDevices: ['300434063679422'],
      associatedCustomers: ['CUST-003'],
      status: 'active',
      notes: 'Shared account for medium-term rentals (8-30 days)',
      loginAttempts: 0,
      lastLoginSuccess: new Date(Date.now() - 1000 * 60 * 60 * 24),
      twoFactorEnabled: true,
    },
    {
      id: 'acc-3',
      email: 'customer.david.cohen@example.com',
      password: '••••••••',
      accountType: 'customer',
      createdDate: new Date('2024-11-01'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 48),
      associatedDevices: ['300434063679423'],
      associatedCustomers: ['CUST-004'],
      status: 'active',
      notes: 'Custom account created per customer request - long-term rental',
      loginAttempts: 0,
      lastLoginSuccess: new Date(Date.now() - 1000 * 60 * 60 * 48),
      twoFactorEnabled: false,
    },
    {
      id: 'acc-4',
      email: 'test.account@magnus.com',
      password: '••••••••',
      accountType: 'test',
      createdDate: new Date('2024-01-10'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 72),
      associatedDevices: ['300434063679424'],
      associatedCustomers: [],
      status: 'active',
      notes: 'Testing account for device validation before customer assignment',
      loginAttempts: 0,
      lastLoginSuccess: new Date(Date.now() - 1000 * 60 * 60 * 72),
      twoFactorEnabled: false,
    },
    {
      id: 'acc-5',
      email: 'old.rental.01@magnus.com',
      password: '••••••••',
      accountType: 'shared',
      createdDate: new Date('2023-06-01'),
      associatedDevices: [],
      associatedCustomers: [],
      status: 'inactive',
      notes: 'Decommissioned account - replaced by rental.shared.03',
      loginAttempts: 0,
      twoFactorEnabled: false,
    },
  ],

  addAccount: (account) =>
    set((state) => ({
      accounts: [
        ...state.accounts,
        {
          ...account,
          id: `acc-${Date.now()}`,
          createdDate: new Date(),
          loginAttempts: 0,
        },
      ],
    })),

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...updates } : account
      ),
    })),

  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    })),

  getAccount: (id) => {
    return get().accounts.find((account) => account.id === id);
  },

  getAccountsByDevice: (imei) => {
    return get().accounts.filter((account) =>
      account.associatedDevices.includes(imei)
    );
  },

  searchAccounts: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().accounts.filter(
      (account) =>
        account.email.toLowerCase().includes(lowerQuery) ||
        account.notes?.toLowerCase().includes(lowerQuery) ||
        account.accountType.toLowerCase().includes(lowerQuery)
    );
  },
}));

/**
 * User Store  
 * Manages rental customer data with support for both mock and real API
 */

import { create } from 'zustand';
import { useAppConfigStore } from './appConfigStore';
import * as userApi from '@/services/api/users';
import { toast } from 'sonner@2.0.3';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idPassport?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  createdAt?: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@example.com',
    phone: '+972-54-123-4567',
    idPassport: '123456789',
    dateOfBirth: '1988-05-15',
    emergencyContactName: 'John Johnson',
    emergencyContactPhone: '+972-54-999-8888',
    address: '123 Dizengoff St',
    city: 'Tel Aviv',
    country: 'Israel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'user-2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@example.com',
    phone: '+972-52-987-6543',
    idPassport: '987654321',
    dateOfBirth: '1992-08-22',
    emergencyContactName: 'Lisa Chen',
    emergencyContactPhone: '+972-52-111-2222',
    address: '456 Rothschild Blvd',
    city: 'Tel Aviv',
    country: 'Israel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: 'user-3',
    firstName: 'Emma',
    lastName: 'Davis',
    email: 'emma.d@example.com',
    phone: '+972-50-111-2222',
    idPassport: '456789123',
    dateOfBirth: '1995-03-10',
    emergencyContactName: 'Robert Davis',
    emergencyContactPhone: '+972-50-333-4444',
    city: 'Jerusalem',
    country: 'Israel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
  {
    id: 'user-4',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'd.cohen@example.com',
    phone: '+972-50-456-7890',
    idPassport: '456789123',
    dateOfBirth: '1985-11-03',
    emergencyContactName: 'Rachel Cohen',
    emergencyContactPhone: '+972-50-555-6666',
    address: '789 Ben Yehuda St',
    city: 'Haifa',
    country: 'Israel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
  searchUsers: (query: string) => User[];
  createUser: (user: Partial<User>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: mockUsers,
  loading: false,
  error: null,

  // Fetch all users
  fetchUsers: async () => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set({ users: mockUsers, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const users = await userApi.listUsers();

      // Transform API response
      const transformedUsers: User[] = users.map(u => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone,
        idPassport: u.id_passport,
        dateOfBirth: u.date_of_birth,
        emergencyContactName: u.emergency_contact_name,
        emergencyContactPhone: u.emergency_contact_phone,
        address: u.address,
        city: u.city,
        country: u.country,
        notes: u.notes,
        createdAt: u.created_at,
      }));

      set({ users: transformedUsers, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ error: message, loading: false });
      toast.error('Failed to load users', { description: message });
    }
  },

  // Get user by ID
  getUserById: (id) => {
    return get().users.find(u => u.id === id);
  },

  // Search users
  searchUsers: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().users.filter(u =>
      u.firstName.toLowerCase().includes(lowerQuery) ||
      u.lastName.toLowerCase().includes(lowerQuery) ||
      u.email?.toLowerCase().includes(lowerQuery) ||
      u.phone?.includes(query) ||
      u.idPassport?.includes(query)
    );
  },

  // Create user
  createUser: async (userData) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        phone: userData.phone,
        idPassport: userData.idPassport,
        dateOfBirth: userData.dateOfBirth,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactPhone: userData.emergencyContactPhone,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        notes: userData.notes,
        createdAt: new Date().toISOString(),
      };

      set(state => ({ users: [...state.users, newUser] }));
      toast.success('User created successfully');
      return;
    }

    set({ loading: true });
    try {
      await userApi.createUser({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        id_passport: userData.idPassport,
        date_of_birth: userData.dateOfBirth,
        emergency_contact_name: userData.emergencyContactName,
        emergency_contact_phone: userData.emergencyContactPhone,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        notes: userData.notes,
      });

      await get().fetchUsers();
      toast.success('User created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error('Failed to create user', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Update user
  updateUser: async (id, updates) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({
        users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
      }));
      toast.success('User updated successfully');
      return;
    }

    set({ loading: true });
    try {
      await userApi.updateUser(id, {
        first_name: updates.firstName,
        last_name: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        id_passport: updates.idPassport,
        date_of_birth: updates.dateOfBirth,
        emergency_contact_name: updates.emergencyContactName,
        emergency_contact_phone: updates.emergencyContactPhone,
        address: updates.address,
        city: updates.city,
        country: updates.country,
        notes: updates.notes,
      });

      await get().fetchUsers();
      toast.success('User updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      toast.error('Failed to update user', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Delete user
  deleteUser: async (id) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({ users: state.users.filter(u => u.id !== id) }));
      toast.success('User deleted successfully');
      return;
    }

    set({ loading: true });
    try {
      await userApi.deleteUser(id);
      set(state => ({ users: state.users.filter(u => u.id !== id), loading: false }));
      toast.success('User deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error('Failed to delete user', { description: message });
      set({ loading: false });
    }
  },
}));

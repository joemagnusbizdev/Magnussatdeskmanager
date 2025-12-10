/**
 * Rental Store
 * Manages rental data with support for both mock and real API
 */

import { create } from 'zustand';
import { useAppConfigStore } from './appConfigStore';
import * as rentalApi from '@/services/api/rentals';
import { toast } from 'sonner@2.0.3';

export interface Rental {
  id: string;
  deviceId: string;
  userId: string;
  orderId?: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'overdue';
  rentalType: 'rental' | 'purchase';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  depositAmount?: number;
  rentalAmount?: number;
  notes?: string;
  // Extended details
  device?: {
    imei: string;
    deviceNumber: number;
    status: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

// Mock data
const mockRentals: Rental[] = [
  {
    id: 'rental-1',
    deviceId: '1',
    userId: 'user-1',
    orderId: 'order-1',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: 'active',
    rentalType: 'rental',
    paymentStatus: 'paid',
    depositAmount: 500,
    rentalAmount: 150,
    user: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+972-54-123-4567',
    },
    device: {
      imei: '300434063679420',
      deviceNumber: 1,
      status: 'active',
    },
  },
  {
    id: 'rental-2',
    deviceId: '2',
    userId: 'user-2',
    orderId: 'order-2',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: 'active',
    rentalType: 'rental',
    paymentStatus: 'paid',
    depositAmount: 500,
    rentalAmount: 200,
    user: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'mchen@example.com',
      phone: '+972-52-987-6543',
    },
    device: {
      imei: '300434063679421',
      deviceNumber: 2,
      status: 'active',
    },
  },
  {
    id: 'rental-3',
    deviceId: '3',
    userId: 'user-3',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString(),
    status: 'pending',
    rentalType: 'rental',
    paymentStatus: 'pending',
    depositAmount: 500,
    rentalAmount: 180,
    user: {
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.d@example.com',
      phone: '+972-50-111-2222',
    },
  },
];

interface RentalStore {
  rentals: Rental[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchRentals: () => Promise<void>;
  getRentalById: (id: string) => Rental | undefined;
  createRental: (rental: Partial<Rental>) => Promise<void>;
  updateRental: (id: string, updates: Partial<Rental>) => Promise<void>;
  deleteRental: (id: string) => Promise<void>;
  completeRental: (id: string) => Promise<void>;
  cancelRental: (id: string, reason?: string) => Promise<void>;
  extendRental: (id: string, newEndDate: string) => Promise<void>;

  // Filters
  getActiveRentals: () => Rental[];
  getExpiringRentals: (days?: number) => Rental[];
  getOverdueRentals: () => Rental[];
  getRentalsByStatus: (status: Rental['status']) => Rental[];
}

export const useRentalStore = create<RentalStore>((set, get) => ({
  rentals: mockRentals,
  loading: false,
  error: null,

  // Fetch all rentals
  fetchRentals: async () => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set({ rentals: mockRentals, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const rentals = await rentalApi.listRentals();
      
      // Transform API response
      const transformedRentals: Rental[] = rentals.map(r => ({
        id: r.id,
        deviceId: r.device_id,
        userId: r.user_id,
        orderId: r.order_id,
        startDate: r.start_date,
        endDate: r.end_date,
        actualReturnDate: r.actual_return_date,
        status: r.status,
        rentalType: r.rental_type,
        paymentStatus: r.payment_status,
        depositAmount: r.deposit_amount,
        rentalAmount: r.rental_amount,
        notes: r.notes,
        device: r.device,
        user: r.user ? {
          firstName: r.user.first_name,
          lastName: r.user.last_name,
          email: r.user.email,
          phone: r.user.phone,
        } : undefined,
      }));

      set({ rentals: transformedRentals, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch rentals';
      set({ error: message, loading: false });
      toast.error('Failed to load rentals', { description: message });
    }
  },

  // Get rental by ID
  getRentalById: (id) => {
    return get().rentals.find(r => r.id === id);
  },

  // Create rental
  createRental: async (rentalData) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      const newRental: Rental = {
        id: `rental-${Date.now()}`,
        deviceId: rentalData.deviceId || '',
        userId: rentalData.userId || '',
        orderId: rentalData.orderId,
        startDate: rentalData.startDate || new Date().toISOString(),
        endDate: rentalData.endDate || new Date().toISOString(),
        status: rentalData.status || 'pending',
        rentalType: rentalData.rentalType || 'rental',
        paymentStatus: rentalData.paymentStatus || 'pending',
        depositAmount: rentalData.depositAmount,
        rentalAmount: rentalData.rentalAmount,
        notes: rentalData.notes,
      };

      set(state => ({ rentals: [...state.rentals, newRental] }));
      toast.success('Rental created successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.createRental({
        device_id: rentalData.deviceId,
        user_id: rentalData.userId,
        order_id: rentalData.orderId,
        start_date: rentalData.startDate,
        end_date: rentalData.endDate,
        status: rentalData.status,
        rental_type: rentalData.rentalType,
        payment_status: rentalData.paymentStatus,
        deposit_amount: rentalData.depositAmount,
        rental_amount: rentalData.rentalAmount,
        notes: rentalData.notes,
      });

      await get().fetchRentals();
      toast.success('Rental created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create rental';
      toast.error('Failed to create rental', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Update rental
  updateRental: async (id, updates) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({
        rentals: state.rentals.map(r => r.id === id ? { ...r, ...updates } : r),
      }));
      toast.success('Rental updated successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.updateRental(id, {
        start_date: updates.startDate,
        end_date: updates.endDate,
        status: updates.status,
        payment_status: updates.paymentStatus,
        notes: updates.notes,
      });

      await get().fetchRentals();
      toast.success('Rental updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update rental';
      toast.error('Failed to update rental', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Delete rental
  deleteRental: async (id) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({ rentals: state.rentals.filter(r => r.id !== id) }));
      toast.success('Rental deleted successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.deleteRental(id);
      set(state => ({ rentals: state.rentals.filter(r => r.id !== id), loading: false }));
      toast.success('Rental deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete rental';
      toast.error('Failed to delete rental', { description: message });
      set({ loading: false });
    }
  },

  // Complete rental
  completeRental: async (id) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({
        rentals: state.rentals.map(r =>
          r.id === id
            ? { ...r, status: 'completed' as const, actualReturnDate: new Date().toISOString() }
            : r
        ),
      }));
      toast.success('Rental completed successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.completeRental(id);
      await get().fetchRentals();
      toast.success('Rental completed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete rental';
      toast.error('Failed to complete rental', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Cancel rental
  cancelRental: async (id, reason) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({
        rentals: state.rentals.map(r =>
          r.id === id ? { ...r, status: 'cancelled' as const, notes: reason } : r
        ),
      }));
      toast.success('Rental cancelled successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.cancelRental(id, reason);
      await get().fetchRentals();
      toast.success('Rental cancelled successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel rental';
      toast.error('Failed to cancel rental', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Extend rental
  extendRental: async (id, newEndDate) => {
    const { useMockData } = useAppConfigStore.getState();

    if (useMockData) {
      set(state => ({
        rentals: state.rentals.map(r =>
          r.id === id ? { ...r, endDate: newEndDate } : r
        ),
      }));
      toast.success('Rental extended successfully');
      return;
    }

    set({ loading: true });
    try {
      await rentalApi.extendRental(id, newEndDate);
      await get().fetchRentals();
      toast.success('Rental extended successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extend rental';
      toast.error('Failed to extend rental', { description: message });
    } finally {
      set({ loading: false });
    }
  },

  // Get active rentals
  getActiveRentals: () => {
    return get().rentals.filter(r => r.status === 'active');
  },

  // Get expiring rentals
  getExpiringRentals: (days = 7) => {
    const now = Date.now();
    const threshold = now + days * 24 * 60 * 60 * 1000;
    return get().rentals.filter(r => {
      if (r.status !== 'active') return false;
      const endDate = new Date(r.endDate).getTime();
      return endDate > now && endDate <= threshold;
    });
  },

  // Get overdue rentals
  getOverdueRentals: () => {
    const now = Date.now();
    return get().rentals.filter(r => {
      if (r.status !== 'active') return false;
      return new Date(r.endDate).getTime() < now;
    });
  },

  // Get rentals by status
  getRentalsByStatus: (status) => {
    return get().rentals.filter(r => r.status === status);
  },
}));

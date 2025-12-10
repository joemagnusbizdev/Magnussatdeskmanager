/**
 * Rentals API Service
 * Handles all rental-related API calls
 */

import apiClient from './client';

export interface Rental {
  id: string;
  device_id: string;
  user_id: string;
  order_id?: string;
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'overdue';
  rental_type: 'rental' | 'purchase';
  payment_status: 'pending' | 'paid' | 'refunded';
  deposit_amount?: number;
  rental_amount?: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface RentalWithDetails extends Rental {
  device?: {
    imei: string;
    device_number: number;
    status: string;
  };
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface ListRentalsParams {
  status?: string;
  device_id?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

// ============================================
// RENTAL API METHODS
// ============================================

/**
 * Get all rentals
 */
export const listRentals = async (params?: ListRentalsParams): Promise<RentalWithDetails[]> => {
  const response = await apiClient.get('/api/inreach/rentals', { params });
  return response.data;
};

/**
 * Get rental by ID
 */
export const getRentalById = async (id: string): Promise<RentalWithDetails> => {
  const response = await apiClient.get(`/api/inreach/rentals/${id}`);
  return response.data;
};

/**
 * Create new rental
 */
export const createRental = async (rentalData: Partial<Rental>): Promise<Rental> => {
  const response = await apiClient.post('/api/inreach/rentals', rentalData);
  return response.data;
};

/**
 * Update rental
 */
export const updateRental = async (id: string, rentalData: Partial<Rental>): Promise<Rental> => {
  const response = await apiClient.put(`/api/inreach/rentals/${id}`, rentalData);
  return response.data;
};

/**
 * Delete rental
 */
export const deleteRental = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/rentals/${id}`);
};

/**
 * Complete rental (return device)
 */
export const completeRental = async (id: string): Promise<Rental> => {
  const response = await apiClient.post(`/api/inreach/rentals/${id}/complete`);
  return response.data;
};

/**
 * Cancel rental
 */
export const cancelRental = async (id: string, reason?: string): Promise<Rental> => {
  const response = await apiClient.post(`/api/inreach/rentals/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Extend rental
 */
export const extendRental = async (id: string, newEndDate: string): Promise<Rental> => {
  const response = await apiClient.post(`/api/inreach/rentals/${id}/extend`, {
    new_end_date: newEndDate,
  });
  return response.data;
};

/**
 * Get active rentals (currently in progress)
 */
export const getActiveRentals = async (): Promise<RentalWithDetails[]> => {
  return listRentals({ status: 'active' });
};

/**
 * Get expiring rentals (ending soon)
 */
export const getExpiringRentals = async (days: number = 7): Promise<RentalWithDetails[]> => {
  const response = await apiClient.get('/api/inreach/rentals/expiring', {
    params: { days },
  });
  return response.data;
};

/**
 * Get overdue rentals
 */
export const getOverdueRentals = async (): Promise<RentalWithDetails[]> => {
  return listRentals({ status: 'overdue' });
};

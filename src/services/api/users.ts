/**
 * Users API Service
 * Handles all user (rental customer) related API calls
 */

import apiClient from './client';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_passport?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================
// USER API METHODS
// ============================================

/**
 * Get all users
 */
export const listUsers = async (params?: ListUsersParams): Promise<User[]> => {
  const response = await apiClient.get('/api/inreach/users', { params });
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/api/inreach/users/${id}`);
  return response.data;
};

/**
 * Search users
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  return listUsers({ search: query });
};

/**
 * Create new user
 */
export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await apiClient.post('/api/inreach/users', userData);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await apiClient.put(`/api/inreach/users/${id}`, userData);
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/inreach/users/${id}`);
};

/**
 * Get user rental history
 */
export const getUserRentalHistory = async (id: string) => {
  const response = await apiClient.get(`/api/inreach/users/${id}/rentals`);
  return response.data;
};

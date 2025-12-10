/**
 * API Services Index
 * Central export for all API services
 */

// Client
export { default as apiClient, isApiConfigured, getApiStatus, checkFeatureFlag } from './client';

// Devices
export * from './devices';

// Rentals
export * from './rentals';

// Users
export * from './users';

// SatDesks
export * from './satdesks';

// Orders
export * from './orders';

// Alerts
export * from './alerts';

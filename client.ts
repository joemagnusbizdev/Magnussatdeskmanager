/**
 * API Client Configuration
 * Handles communication with Magnus Garmin ECC Backend
 * 
 * FIXED: Corrected API base URL and endpoints
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// ============================================
// API CONFIGURATION - FIXED!
// ============================================

// Read from environment variable, fallback to production URL
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'https://magnussatdeskmanager.onrender.com';
const API_KEY = import.meta.env?.VITE_API_KEY || '';

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  hasApiKey: Boolean(API_KEY),
  env: import.meta.env?.MODE,
});

// ============================================
// AXIOS INSTANCE
// ============================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR (Add API Key)
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add API key to headers
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
    }

    // Log request in development
    if (import.meta.env?.DEV) {
      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR (Error Handling)
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env?.DEV) {
      console.log(`[API RESPONSE] ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

// ============================================
// ERROR HANDLER
// ============================================

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data;

    console.error('[API ERROR]', {
      status,
      url: error.config?.url,
      data,
    });

    switch (status) {
      case 401:
        toast.error('Unauthorized', {
          description: 'Invalid API key. Please check your configuration.',
        });
        break;

      case 403:
        toast.error('Access Denied', {
          description: data?.message || 'You do not have permission to perform this action.',
        });
        break;

      case 404:
        toast.error('Not Found', {
          description: data?.message || 'The requested resource was not found.',
        });
        break;

      case 422:
        toast.error('Validation Error', {
          description: data?.message || 'Invalid data provided.',
        });
        break;

      case 500:
        toast.error('Server Error', {
          description: 'An unexpected error occurred. Please try again later.',
        });
        break;

      case 503:
        toast.error('Service Unavailable', {
          description: data?.message || 'The inReach Manager service is currently disabled.',
        });
        break;

      default:
        toast.error('Error', {
          description: data?.message || data?.error || 'An unexpected error occurred.',
        });
    }
  } else if (error.request) {
    // Request made but no response
    console.error('[API NETWORK ERROR]', error.request);
    toast.error('Network Error', {
      description: 'Unable to reach the server. Please check your internet connection.',
    });
  } else {
    // Error setting up request
    console.error('[API SETUP ERROR]', error.message);
    toast.error('Request Error', {
      description: error.message,
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if API is configured
 */
export const isApiConfigured = (): boolean => {
  return Boolean(API_BASE_URL);
};

/**
 * Get API status
 */
export const getApiStatus = async () => {
  try {
    const response = await apiClient.get('/api/webhooks/test');
    return {
      status: 'connected',
      data: response.data,
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get API stats
 */
export const getApiStats = async () => {
  try {
    const response = await apiClient.get('/api/webhooks/stats');
    return response.data;
  } catch (error) {
    console.error('[API] Failed to get stats', error);
    throw error;
  }
};

export default apiClient;

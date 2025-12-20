/**
 * Centralized configuration for the application
 * All environment variables should be accessed through this file
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Validate that base URL is set
  getBaseURL(): string {
    const url = this.baseURL;
    
    if (!url) {
      console.error('NEXT_PUBLIC_API_URL is not set in environment variables');
      throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env.local file');
    }
    
    // Remove trailing slash if present
    return url.replace(/\/$/, '');
  },
} as const;

// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  getClientId(): string {
    const clientId = this.clientId;
    
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
    }
    
    return clientId;
  },
  
  isConfigured(): boolean {
    return !!this.clientId;
  },
} as const;

// Environment check (for development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    baseURL: API_CONFIG.getBaseURL(),
    googleOAuthConfigured: GOOGLE_OAUTH_CONFIG.isConfigured(),
  });
}


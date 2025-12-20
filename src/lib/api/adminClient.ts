import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../config';

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.getBaseURL(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add admin auth token
    this.client.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear all admin auth data
          this.clearAuth();
          
          // Only redirect if not already on admin login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/admin/login')) {
              window.location.href = '/admin/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    // Clear admin token and user from localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('admin_token', token);
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const adminApiClient = new AdminApiClient();
export default adminApiClient.getClient();


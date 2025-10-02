import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, AppError } from '@nextgen-marketplace/types';

export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001') {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const appError: AppError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: this.extractErrorMessage(error),
          details: error.response?.data,
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.removeToken();
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(appError);
      }
    );
  }

  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError)) return firstError[0];
        return String(firstError);
      }
    }
    return error.message || 'خطای غیرمنتظره‌ای رخ داده است';
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url);
    return response.data;
  }

  // File upload
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Set token (for login)
  setToken(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
}

export const apiClient = new ApiClient();
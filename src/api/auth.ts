// src/api/auth.ts
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import { User } from '../types/models';
import { LoginResponse, RegisterResponse } from '../types/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        await AsyncStorage.setItem('accessToken', access);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        // Redirect to login would happen via redux
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API interfaces
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ProfileUpdateData {
  bio?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location?: string;
  occupation?: string;
}

export interface PhoneVerificationData {
  phone_number: string;
  verification_code: string;
}

// Auth APIs
export const authAPI = {
  register: (userData: RegisterData): Promise<AxiosResponse<RegisterResponse>> => {
    return apiClient.post('/users/register/', userData);
  },
  
  login: async (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => {
    const response = await apiClient.post<LoginResponse>('/token/', { email, password });
    const { access, refresh } = response.data;
    
    // Store tokens
    await AsyncStorage.setItem('accessToken', access);
    await AsyncStorage.setItem('refreshToken', refresh);
    
    return response;
  },
  
  logout: async (): Promise<{ success: boolean }> => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    return { success: true };
  },
  
  getCurrentUser: (): Promise<AxiosResponse<User>> => {
    return apiClient.get('/users/me/');
  },
  
  updateProfile: (profileData: ProfileUpdateData): Promise<AxiosResponse<User>> => {
    return apiClient.patch('/profiles/me/', profileData);
  },
  
  verifyPhone: (phone: string, code: string): Promise<AxiosResponse<any>> => {
    return apiClient.post('/users/verify_phone/', { 
      phone_number: phone, 
      verification_code: code 
    });
  },
  
  requestPhoneVerification: (phone: string): Promise<AxiosResponse<any>> => {
    return apiClient.post('/users/request_phone_verification/', { 
      phone_number: phone 
    });
  },
  
  firebaseAuth: (firebaseToken: string): Promise<AxiosResponse<LoginResponse>> => {
    return apiClient.post('/auth/firebase/', { token: firebaseToken });
  }
};

export default apiClient;
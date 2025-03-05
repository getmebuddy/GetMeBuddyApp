import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to point to your Django backend
// Use your computer's IP address instead of localhost for testing with a real device
const API_URL = 'http://localhost:8000/api';  // Replace with your actual IP

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
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
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        await AsyncStorage.setItem('accessToken', access);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => {
    return apiClient.post('/users/register/', userData);
  },
  
  login: async (email, password) => {
    const response = await apiClient.post('/token/', { email, password });
    const { access, refresh } = response.data;
    
    // Store tokens
    await AsyncStorage.setItem('accessToken', access);
    await AsyncStorage.setItem('refreshToken', refresh);
    
    return response;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    return { success: true };
  },
  
  getCurrentUser: () => {
    return apiClient.get('/users/me/');
  },
  
  updateProfile: (profileData) => {
    return apiClient.patch('/profiles/me/', profileData);
  },
  
  verifyPhone: (phone, code) => {
    return apiClient.post('/users/verify_phone/', { 
      phone_number: phone, 
      verification_code: code 
    });
  },
  
  requestPhoneVerification: (phone) => {
    return apiClient.post('/users/request_phone_verification/', { 
      phone_number: phone 
    });
  },
};

export default apiClient;
// src/services/VerificationService.js
import apiClient from '../api/auth';

export const verificationService = {
  // Basic verification (all users)
  verifyEmail: async (email, verificationCode) => {
    return apiClient.post('/verification/email', { email, verificationCode });
  },
  
  verifyPhone: async (phone, verificationCode) => {
    return apiClient.post('/verification/phone', { phone, verificationCode });
  },
  
  // Enhanced verification (recommended)
  verifyIdentity: async (idImages) => {
    const formData = new FormData();
    idImages.forEach((image, index) => {
      formData.append(`idImage${index}`, image);
    });
    return apiClient.post('/verification/identity', formData);
  },
  
  // Premium verification (required for companionship)
  requestBackgroundCheck: async (userData) => {
    return apiClient.post('/verification/background-check', userData);
  },
  
  submitReferences: async (references) => {
    return apiClient.post('/verification/references', { references });
  },
  
  getVerificationStatus: async (userId) => {
    return apiClient.get(`/verification/status/${userId}`);
  }
};
// src/api/companionship.js
import apiClient from './auth';

export const companionshipAPI = {
  // Get available companions based on filters
  getCompanions: (filters) => {
    return apiClient.get('/companionship/companions', { params: filters });
  },
  
  // Get companion details
  getCompanionProfile: (userId) => {
    return apiClient.get(`/companionship/companions/${userId}`);
  },
  
  // Request companionship
  requestCompanionship: (companionId, requestDetails) => {
    return apiClient.post('/companionship/requests', {
      companion_id: companionId,
      ...requestDetails
    });
  },
  
  // Get companionship requests (as a companion)
  getCompanionshipRequests: () => {
    return apiClient.get('/companionship/requests/received');
  },
  
  // Respond to companionship request
  respondToRequest: (requestId, response) => {
    return apiClient.post(`/companionship/requests/${requestId}/respond`, {
      response // 'accept' or 'decline'
    });
  },
  
  // Get companionship request status (as a requester)
  getRequestStatus: (requestId) => {
    return apiClient.get(`/companionship/requests/${requestId}`);
  },
  
  // Leave review for companion
  leaveCompanionReview: (companionId, reviewData) => {
    return apiClient.post(`/companionship/reviews`, {
      companion_id: companionId,
      ...reviewData
    });
  },
  
  // Get reviews for a companion
  getCompanionReviews: (companionId) => {
    return apiClient.get(`/companionship/reviews/${companionId}`);
  }
};
import apiClient from './auth'; // apiClient is an AxiosInstance
import { AxiosResponse } from 'axios';
import { User } from '../models/UserProfile'; // Assuming a UserProfile model/type

// Placeholder types - these should be refined based on actual API schema

// Filters for getCompanions
export interface CompanionFilters {
  activity?: string;
  availability?: string; // e.g., 'weekends', 'evenings'
  location?: string; // or more complex object for coordinates
  min_rating?: number;
  // Add other relevant filters
}

// Details for requesting companionship
export interface CompanionshipRequestDetails {
  message?: string;
  proposed_date_time?: string; // ISO 8601 date-time
  duration_hours?: number;
  // Add other relevant details
}

// Data for leaving a review
export interface CompanionReviewData {
  rating: number; // e.g., 1-5
  comment?: string;
  // Add other review fields if any
}

// Structure for a Companion (summary view)
export interface CompanionSummary extends User { // Extends base User or has specific fields
  average_rating?: number;
  specialties?: string[];
  // Add other fields displayed in lists
}

// Structure for a full Companion Profile
export interface CompanionProfile extends User {
  bio: string;
  reviews: CompanionReview[];
  availability_schedule?: any; // Define more specifically
  // Add all detailed fields
}

// Structure for a Companionship Request
export interface CompanionshipRequest {
  id: string | number;
  requester_id: string | number;
  requester_details?: User; // Optional: embed requester details
  companion_id: string | number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message?: string;
  proposed_date_time?: string;
  created_at: string;
  // Add other fields
}

// Structure for a Companion Review
export interface CompanionReview {
  id: string | number;
  reviewer_id: string | number;
  reviewer_name?: string; // Optional: if not embedding full user
  companion_id: string | number;
  rating: number;
  comment?: string;
  created_at: string;
  // Add other fields
}

export const companionshipAPI = {
  getCompanions: (filters?: CompanionFilters): Promise<AxiosResponse<CompanionSummary[]>> => {
    return apiClient.get('/companionship/companions', { params: filters });
  },

  getCompanionProfile: (userId: string | number): Promise<AxiosResponse<CompanionProfile>> => {
    return apiClient.get(`/companionship/companions/${userId}`);
  },

  requestCompanionship: (
    companionId: string | number,
    requestDetails: CompanionshipRequestDetails
  ): Promise<AxiosResponse<CompanionshipRequest>> => {
    return apiClient.post('/companionship/requests', {
      companion_id: companionId,
      ...requestDetails,
    });
  },

  // Gets requests received by the currently authenticated user (who is a companion)
  getCompanionshipRequests: (): Promise<AxiosResponse<CompanionshipRequest[]>> => {
    return apiClient.get('/companionship/requests/received');
  },

  respondToRequest: (
    requestId: string | number,
    response: 'accept' | 'decline'
  ): Promise<AxiosResponse<CompanionshipRequest>> => {
    return apiClient.post(`/companionship/requests/${requestId}/respond`, {
      response,
    });
  },

  // Gets status of a request made by the currently authenticated user
  getRequestStatus: (requestId: string | number): Promise<AxiosResponse<CompanionshipRequest>> => {
    return apiClient.get(`/companionship/requests/${requestId}`);
  },

  leaveCompanionReview: (
    companionId: string | number,
    reviewData: CompanionReviewData
  ): Promise<AxiosResponse<CompanionReview>> => {
    return apiClient.post(`/companionship/reviews`, {
      companion_id: companionId,
      ...reviewData,
    });
  },

  getCompanionReviews: (companionId: string | number): Promise<AxiosResponse<CompanionReview[]>> => {
    return apiClient.get(`/companionship/reviews/${companionId}`);
  },
};

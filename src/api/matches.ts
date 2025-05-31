import apiClient from './auth'; // apiClient is an AxiosInstance
import { AxiosResponse } from 'axios';
import { User } from '../models/UserProfile'; // Assuming a UserProfile model/type

// Placeholder types - these should be refined based on actual API schema

// Represents a user profile in the context of matching
export interface PotentialMatchUser extends User {
  compatibility_score?: number; // Example field
  common_interests?: string[];
}

// Represents a match object
export interface Match {
  id: string | number;
  initiator_id: string | number;
  responder_id: string | number;
  status: 'pending' | 'accepted' | 'rejected' | 'unmatched';
  created_at: string;
  // May include details of both users if the API embeds them
  initiator_details?: User;
  responder_details?: User;
}

// Represents user's matching preferences
export interface MatchPreferences {
  age_range_min?: number;
  age_range_max?: number;
  preferred_gender?: 'male' | 'female' | 'non-binary' | 'any';
  location_radius_km?: number;
  interest_keywords?: string[];
  // Add other preference fields
}

export const matchesAPI = {
  // Gets users that could be a match for the current user
  getPotentialMatches: (): Promise<AxiosResponse<PotentialMatchUser[]>> => {
    return apiClient.get('/matching/matches/potential_matches/');
  },

  // Initiates a match request (e.g., "swipe right" or "send like")
  createMatchRequest: (responderId: string | number): Promise<AxiosResponse<Match>> => {
    return apiClient.post('/matching/matches/create_match/', { // Endpoint name might vary
      responder_id: responderId,
    });
  },

  // Responds to a match request directed at the current user
  respondToMatchRequest: (
    matchId: string | number,
    response: 'accept' | 'reject'
  ): Promise<AxiosResponse<Match>> => {
    return apiClient.post(`/matching/matches/${matchId}/respond/`, {
      response: response,
    });
  },

  // Gets all active/accepted matches for the current user
  getAcceptedMatches: (): Promise<AxiosResponse<Match[]>> => {
    return apiClient.get('/matching/matches/'); // Endpoint might be more specific e.g., /matching/matches/accepted/
  },

  // Gets the current user's matching preferences
  getMatchPreferences: (): Promise<AxiosResponse<MatchPreferences>> => {
    return apiClient.get('/matching/preferences/');
  },

  // Updates the current user's matching preferences
  updateMatchPreferences: (
    preferences: Partial<MatchPreferences> // Use Partial if not all fields are required for update
  ): Promise<AxiosResponse<MatchPreferences>> => {
    return apiClient.patch('/matching/preferences/', preferences);
  },
};

// src/api/matches.js
import apiClient from './auth';

export const matchesAPI = {
  getPotentialMatches: () => {
    return apiClient.get('/matching/matches/potential_matches/');
  },
  
  createMatch: (responderId) => {
    return apiClient.post('/matching/matches/create_match/', {
      responder_id: responderId
    });
  },
  
  respondToMatch: (matchId, response) => {
    return apiClient.post(`/matching/matches/${matchId}/respond/`, {
      response: response // 'accept' or 'reject'
    });
  },
  
  getMatches: () => {
    return apiClient.get('/matching/matches/');
  },
  
  getMatchPreferences: () => {
    return apiClient.get('/matching/preferences/');
  },
  
  updateMatchPreferences: (preferences) => {
    return apiClient.patch('/matching/preferences/', preferences);
  }
};
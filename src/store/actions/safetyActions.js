// src/store/actions/safetyActions.js
import {
    REPORT_USER_REQUEST,
    REPORT_USER_SUCCESS,
    REPORT_USER_FAILURE,
    BLOCK_USER_REQUEST,
    BLOCK_USER_SUCCESS,
    BLOCK_USER_FAILURE,
    SHARE_LOCATION_REQUEST,
    SHARE_LOCATION_SUCCESS,
    SHARE_LOCATION_FAILURE
  } from './types';
  import apiClient from '../../api/auth';
  
  export const reportUser = (userId, reason) => {
    return async (dispatch) => {
      dispatch({ type: REPORT_USER_REQUEST });
      
      try {
        const response = await apiClient.post('/safety/report', {
          reported_user_id: userId,
          reason: reason
        });
        
        dispatch({ 
          type: REPORT_USER_SUCCESS, 
          payload: response.data 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: REPORT_USER_FAILURE, 
          payload: error.response?.data || 'Failed to report user' 
        });
        
        throw error;
      }
    };
  };
  
  export const blockUser = (userId) => {
    return async (dispatch) => {
      dispatch({ type: BLOCK_USER_REQUEST });
      
      try {
        const response = await apiClient.post('/safety/block', {
          blocked_user_id: userId
        });
        
        dispatch({ 
          type: BLOCK_USER_SUCCESS, 
          payload: { blockedUserId: userId } 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: BLOCK_USER_FAILURE, 
          payload: error.response?.data || 'Failed to block user' 
        });
        
        throw error;
      }
    };
  };
  
  export const shareLocation = (meetingId) => {
    return async (dispatch) => {
      dispatch({ type: SHARE_LOCATION_REQUEST });
      
      try {
        // Get current location from device
        // This is simplified - in a real app you would use Geolocation API
        const location = {
          latitude: 37.7749,
          longitude: -122.4194
        };
        
        const response = await apiClient.post('/safety/share-location', {
          meeting_id: meetingId,
          location: location
        });
        
        dispatch({ 
          type: SHARE_LOCATION_SUCCESS, 
          payload: { meetingId, location } 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: SHARE_LOCATION_FAILURE, 
          payload: error.response?.data || 'Failed to share location' 
        });
        
        throw error;
      }
    };
  };
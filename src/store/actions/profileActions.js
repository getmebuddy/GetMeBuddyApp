// src/store/actions/profileActions.js
import {
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAILURE,
    SET_USER_TYPE,
    COMPLETE_ONBOARDING
  } from './types';
  import apiClient from '../../api/auth';
  
  export const updateProfile = (profileData) => {
    return async (dispatch) => {
      dispatch({ type: UPDATE_PROFILE_REQUEST });
      
      try {
        const response = await apiClient.patch('/profiles/me/', profileData);
        
        dispatch({ 
          type: UPDATE_PROFILE_SUCCESS, 
          payload: response.data 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: UPDATE_PROFILE_FAILURE, 
          payload: error.response?.data || 'Failed to update profile' 
        });
        
        throw error;
      }
    };
  };
  
  export const setUserType = (userType) => {
    return {
      type: SET_USER_TYPE,
      payload: userType
    };
  };
  
  export const completeOnboarding = () => {
    return {
      type: COMPLETE_ONBOARDING
    };
  };
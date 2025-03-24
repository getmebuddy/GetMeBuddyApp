// src/store/actions/companionshipActions.js
import {
    GET_COMPANIONS_REQUEST,
    GET_COMPANIONS_SUCCESS,
    GET_COMPANIONS_FAILURE,
    REQUEST_COMPANIONSHIP_REQUEST,
    REQUEST_COMPANIONSHIP_SUCCESS,
    REQUEST_COMPANIONSHIP_FAILURE
  } from './types';
  import { companionshipAPI } from '../../api/companionship';
  
  export const getCompanions = (filters = {}) => {
    return async (dispatch) => {
      dispatch({ type: GET_COMPANIONS_REQUEST });
      
      try {
        const response = await companionshipAPI.getCompanions(filters);
        
        dispatch({ 
          type: GET_COMPANIONS_SUCCESS, 
          payload: response.data 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: GET_COMPANIONS_FAILURE, 
          payload: error.response?.data || 'Failed to fetch companions' 
        });
        
        throw error;
      }
    };
  };
  
  export const requestCompanionship = (companionId, requestDetails) => {
    return async (dispatch) => {
      dispatch({ type: REQUEST_COMPANIONSHIP_REQUEST });
      
      try {
        const response = await companionshipAPI.requestCompanionship(companionId, requestDetails);
        
        dispatch({ 
          type: REQUEST_COMPANIONSHIP_SUCCESS, 
          payload: response.data 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: REQUEST_COMPANIONSHIP_FAILURE, 
          payload: error.response?.data || 'Failed to request companionship' 
        });
        
        throw error;
      }
    };
  };
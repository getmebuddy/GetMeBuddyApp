// src/store/actions/verificationActions.js
import {
    VERIFY_EMAIL_REQUEST,
    VERIFY_EMAIL_SUCCESS,
    VERIFY_EMAIL_FAILURE,
    VERIFY_PHONE_REQUEST,
    VERIFY_PHONE_SUCCESS,
    VERIFY_PHONE_FAILURE,
    VERIFY_ID_REQUEST,
    VERIFY_ID_SUCCESS,
    VERIFY_ID_FAILURE,
    GET_VERIFICATION_STATUS_REQUEST,
    GET_VERIFICATION_STATUS_SUCCESS,
    GET_VERIFICATION_STATUS_FAILURE
  } from './types';
  import { verificationService } from '../../services/VerificationService';
  
  export const verifyEmail = (email, verificationCode) => {
    return async (dispatch) => {
      dispatch({ type: VERIFY_EMAIL_REQUEST });
      
      try {
        const response = await verificationService.verifyEmail(email, verificationCode);
        
        dispatch({ 
          type: VERIFY_EMAIL_SUCCESS 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: VERIFY_EMAIL_FAILURE, 
          payload: error.response?.data || 'Failed to verify email' 
        });
        
        throw error;
      }
    };
  };
  
  export const verifyPhone = (phone, verificationCode) => {
    return async (dispatch) => {
      dispatch({ type: VERIFY_PHONE_REQUEST });
      
      try {
        const response = await verificationService.verifyPhone(phone, verificationCode);
        
        dispatch({ 
          type: VERIFY_PHONE_SUCCESS 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: VERIFY_PHONE_FAILURE, 
          payload: error.response?.data || 'Failed to verify phone' 
        });
        
        throw error;
      }
    };
  };
  
  export const verifyIdentity = (idImages) => {
    return async (dispatch) => {
      dispatch({ type: VERIFY_ID_REQUEST });
      
      try {
        const response = await verificationService.verifyIdentity(idImages);
        
        dispatch({ 
          type: VERIFY_ID_SUCCESS 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: VERIFY_ID_FAILURE, 
          payload: error.response?.data || 'Failed to verify identity' 
        });
        
        throw error;
      }
    };
  };
  
  export const getVerificationStatus = () => {
    return async (dispatch) => {
      dispatch({ type: GET_VERIFICATION_STATUS_REQUEST });
      
      try {
        const response = await verificationService.getVerificationStatus();
        
        dispatch({ 
          type: GET_VERIFICATION_STATUS_SUCCESS, 
          payload: response.data 
        });
        
        return response;
      } catch (error) {
        dispatch({ 
          type: GET_VERIFICATION_STATUS_FAILURE, 
          payload: error.response?.data || 'Failed to get verification status' 
        });
        
        throw error;
      }
    };
  };
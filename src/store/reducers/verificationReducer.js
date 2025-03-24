// src/store/reducers/verificationReducer.js
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
  } from '../actions/types';
  
  const initialState = {
    verificationStatus: {
      emailVerified: false,
      phoneVerified: false,
      photoVerified: false,
      idVerified: false,
      videoVerified: false,
      socialVerified: false,
      backgroundVerified: false,
      referencesVerified: false,
      safetyTrainingComplete: false,
      level: 'none' // 'none', 'basic', 'enhanced', 'premium'
    },
    loading: false,
    error: null
  };
  
  const verificationReducer = (state = initialState, action) => {
    switch (action.type) {
      case VERIFY_EMAIL_REQUEST:
      case VERIFY_PHONE_REQUEST:
      case VERIFY_ID_REQUEST:
      case GET_VERIFICATION_STATUS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case VERIFY_EMAIL_SUCCESS:
        return {
          ...state,
          verificationStatus: {
            ...state.verificationStatus,
            emailVerified: true
          },
          loading: false
        };
      
      case VERIFY_PHONE_SUCCESS:
        return {
          ...state,
          verificationStatus: {
            ...state.verificationStatus,
            phoneVerified: true
          },
          loading: false
        };
      
      case VERIFY_ID_SUCCESS:
        return {
          ...state,
          verificationStatus: {
            ...state.verificationStatus,
            idVerified: true
          },
          loading: false
        };
      
      case GET_VERIFICATION_STATUS_SUCCESS:
        return {
          ...state,
          verificationStatus: action.payload,
          loading: false
        };
      
      case VERIFY_EMAIL_FAILURE:
      case VERIFY_PHONE_FAILURE:
      case VERIFY_ID_FAILURE:
      case GET_VERIFICATION_STATUS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      default:
        return state;
    }
  };
  
  export default verificationReducer;
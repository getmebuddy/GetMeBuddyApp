// src/store/reducers/safetyReducer.js
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
  } from '../actions/types';
  
  const initialState = {
    blockedUsers: [],
    sharedLocations: [],
    loading: false,
    error: null
  };
  
  const safetyReducer = (state = initialState, action) => {
    switch (action.type) {
      case REPORT_USER_REQUEST:
      case BLOCK_USER_REQUEST:
      case SHARE_LOCATION_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case REPORT_USER_SUCCESS:
        return {
          ...state,
          loading: false
        };
      
      case BLOCK_USER_SUCCESS:
        return {
          ...state,
          blockedUsers: [...state.blockedUsers, action.payload.blockedUserId],
          loading: false
        };
      
      case SHARE_LOCATION_SUCCESS:
        return {
          ...state,
          sharedLocations: [...state.sharedLocations, {
            meetingId: action.payload.meetingId,
            location: action.payload.location,
            timestamp: new Date().toISOString()
          }],
          loading: false
        };
      
      case REPORT_USER_FAILURE:
      case BLOCK_USER_FAILURE:
      case SHARE_LOCATION_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      default:
        return state;
    }
  };
  
  export default safetyReducer;
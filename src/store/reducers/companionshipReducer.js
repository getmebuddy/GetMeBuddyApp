// src/store/reducers/companionshipReducer.js
import {
    GET_COMPANIONS_REQUEST,
    GET_COMPANIONS_SUCCESS,
    GET_COMPANIONS_FAILURE,
    REQUEST_COMPANIONSHIP_REQUEST,
    REQUEST_COMPANIONSHIP_SUCCESS,
    REQUEST_COMPANIONSHIP_FAILURE
  } from '../actions/types';
  
  const initialState = {
    companions: [],
    companionshipRequests: [],
    loading: false,
    error: null
  };
  
  const companionshipReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_COMPANIONS_REQUEST:
      case REQUEST_COMPANIONSHIP_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case GET_COMPANIONS_SUCCESS:
        return {
          ...state,
          companions: action.payload,
          loading: false
        };
      
      case REQUEST_COMPANIONSHIP_SUCCESS:
        return {
          ...state,
          companionshipRequests: [...state.companionshipRequests, action.payload],
          loading: false
        };
      
      case GET_COMPANIONS_FAILURE:
      case REQUEST_COMPANIONSHIP_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      default:
        return state;
    }
  };
  
  export default companionshipReducer;
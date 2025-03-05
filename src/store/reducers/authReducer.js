// src/store/reducers/authReducer.js
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAILURE,
    GET_USER_REQUEST,
    GET_USER_SUCCESS,
    GET_USER_FAILURE
  } from '../actions/authActions';
  
  const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
  };
  
  const authReducer = (state = initialState, action) => {
    switch (action.type) {
      case LOGIN_REQUEST:
      case REGISTER_REQUEST:
      case GET_USER_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case LOGIN_SUCCESS:
      case REGISTER_SUCCESS:
      case GET_USER_SUCCESS:
        return {
          ...state,
          loading: false,
          user: action.payload,
          isAuthenticated: true,
          error: null
        };
      
      case LOGIN_FAILURE:
      case REGISTER_FAILURE:
      case GET_USER_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
          isAuthenticated: false
        };
      
      case LOGOUT:
        return {
          ...state,
          user: null,
          isAuthenticated: false,
          error: null
        };
      
      default:
        return state;
    }
  };
  
  export default authReducer;
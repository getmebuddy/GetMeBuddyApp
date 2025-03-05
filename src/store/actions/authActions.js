// src/store/actions/authActions.js
import { authAPI } from '../../api/auth';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';
export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_FAILURE = 'GET_USER_FAILURE';

export const login = (email, password) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    
    try {
      const response = await authAPI.login(email, password);
      dispatch({ 
        type: LOGIN_SUCCESS, 
        payload: response.data.user 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: LOGIN_FAILURE, 
        payload: error.response?.data?.detail || 'Login failed' 
      });
      throw error;
    }
  };
};

export const register = (userData) => {
  return async (dispatch) => {
    dispatch({ type: REGISTER_REQUEST });
    
    try {
      const response = await authAPI.register(userData);
      dispatch({ 
        type: REGISTER_SUCCESS, 
        payload: response.data.user 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: REGISTER_FAILURE, 
        payload: error.response?.data || 'Registration failed' 
      });
      throw error;
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    await authAPI.logout();
    dispatch({ type: LOGOUT });
  };
};

export const getCurrentUser = () => {
  return async (dispatch) => {
    dispatch({ type: GET_USER_REQUEST });
    
    try {
      const response = await authAPI.getCurrentUser();
      dispatch({ 
        type: GET_USER_SUCCESS, 
        payload: response.data 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: GET_USER_FAILURE, 
        payload: error.response?.data?.detail || 'Failed to get user' 
      });
      throw error;
    }
  };
};
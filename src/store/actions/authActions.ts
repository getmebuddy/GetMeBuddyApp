import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import { authAPI, RegisterData, LoginResponse as ApiLoginResponse } from '../../api/auth'; // Assuming RegisterData & LoginResponse are exported from auth API
import { UserProfile } from '../../models/UserProfile'; // For User type
import { AppDispatch, RootState } from '../index'; // Assuming these are defined in store/index.ts

import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE,
} from './types';

// Action Interfaces
export interface LoginRequestAction extends Action<typeof LOGIN_REQUEST> {}
export interface LoginSuccessAction extends Action<typeof LOGIN_SUCCESS> {
  payload: { user: UserProfile; token: string }; // Assuming token is also part of login success
}
export interface LoginFailureAction extends Action<typeof LOGIN_FAILURE> {
  payload: string; // Error message
}

export interface LogoutAction extends Action<typeof LOGOUT> {}

export interface RegisterRequestAction extends Action<typeof REGISTER_REQUEST> {}
export interface RegisterSuccessAction extends Action<typeof REGISTER_SUCCESS> {
  payload: { user: UserProfile; token: string }; // Assuming token is also part of register success
}
export interface RegisterFailureAction extends Action<typeof REGISTER_FAILURE> {
  payload: any; // Or a more specific error type
}

export interface GetUserRequestAction extends Action<typeof GET_USER_REQUEST> {}
export interface GetUserSuccessAction extends Action<typeof GET_USER_SUCCESS> {
  payload: UserProfile;
}
export interface GetUserFailureAction extends Action<typeof GET_USER_FAILURE> {
  payload: string;
}

export type AuthActionTypes =
  | LoginRequestAction | LoginSuccessAction | LoginFailureAction
  | LogoutAction
  | RegisterRequestAction | RegisterSuccessAction | RegisterFailureAction
  | GetUserRequestAction | GetUserSuccessAction | GetUserFailureAction;

// ThunkAction type: ThunkAction<ReturnType, StateType, ExtraThunkArgType, ActionType>
type AppThunk<ReturnType = void> = ThunkAction<Promise<AxiosResponse<any> | ReturnType>, RootState, unknown, AuthActionTypes>;

export const login = (email: string, password: string): AppThunk<ApiLoginResponse> => {
  return async (dispatch: AppDispatch) => {
    const requestAction: LoginRequestAction = { type: LOGIN_REQUEST };
    dispatch(requestAction);
    try {
      const response = await authAPI.login(email, password); // This already stores tokens via AsyncStorage in authAPI
      // Assuming response.data contains { user: UserProfile, access: string, refresh: string }
      const apiResponseData = response.data as ApiLoginResponse; // Type assertion for clarity
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: apiResponseData.user, token: apiResponseData.access },
      });
      return response; // Return full Axios response
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};

export const register = (userData: RegisterData): AppThunk<ApiLoginResponse> => { // Assuming RegisterData from api/auth.ts
  return async (dispatch: AppDispatch) => {
    const requestAction: RegisterRequestAction = { type: REGISTER_REQUEST };
    dispatch(requestAction);
    try {
      const response = await authAPI.register(userData);
      // Assuming response.data contains { user: UserProfile, access: string, refresh: string }
      const apiResponseData = response.data as ApiLoginResponse; // Type assertion
      dispatch({
        type: REGISTER_SUCCESS,
        payload: { user: apiResponseData.user, token: apiResponseData.access },
      });
      // Potentially call login action here or handle token storage as part of register API
      return response;
    } catch (error: any) {
      // More detailed error handling for registration if backend provides specific field errors
      const errorMessage = error.response?.data || 'Registration failed';
      dispatch({ type: REGISTER_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};

export const logout = (): AppThunk<void> => { // Return type is Promise<void> for the thunk itself
  return async (dispatch: AppDispatch) => {
    await authAPI.logout(); // Clears AsyncStorage
    const logoutActionInstance: LogoutAction = { type: LOGOUT };
    dispatch(logoutActionInstance);
  };
};

export const getCurrentUser = (): AppThunk<AxiosResponse<UserProfile>> => {
  return async (dispatch: AppDispatch) => {
    const requestAction: GetUserRequestAction = { type: GET_USER_REQUEST };
    dispatch(requestAction);
    try {
      const response = await authAPI.getCurrentUser(); // Assuming this returns AxiosResponse<UserProfile>
      dispatch({ type: GET_USER_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch user details';
      dispatch({ type: GET_USER_FAILURE, payload: errorMessage });
      // Potentially dispatch logout if 401 or token is invalid
      if (error.response?.status === 401) {
        dispatch(logout() as any); // Dispatch another thunk, type assertion might be needed
      }
      throw error;
    }
  };
};

// Action to set user and token from persisted state (e.g., on app load)
export interface SetAuthStateAction extends Action<'SET_AUTH_STATE'> {
  payload: { user: UserProfile | null; token: string | null };
}
export const setAuthState = (user: UserProfile | null, token: string | null): SetAuthStateAction => ({
  type: 'SET_AUTH_STATE', // This type also needs to be in ./types.ts and AuthActionTypes
  payload: { user, token },
});
// Remember to add 'SET_AUTH_STATE' to types.ts and AuthActionTypes union type.
// Also, the authReducer needs to handle this action.

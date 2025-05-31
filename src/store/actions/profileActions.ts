import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import apiClient from '../../api/auth'; // Assuming this is an AxiosInstance
import { UserProfile } from '../../models/UserProfile';
import { AppDispatch, RootState } from '../index';

import {
  UPDATE_PROFILE_REQUEST, UPDATE_PROFILE_SUCCESS, UPDATE_PROFILE_FAILURE,
  SET_USER_TYPE,
  COMPLETE_ONBOARDING,
  FETCH_PROFILE_REQUEST, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE, // Added for fetching profile
} from './types'; // Ensure types.ts has FETCH_PROFILE actions

// Define UserPurposeType if not already globally available
export type UserPurposeType = 'activity' | 'companion' | 'both' | null;

// Action Interfaces
export interface UpdateProfileRequestAction extends Action<typeof UPDATE_PROFILE_REQUEST> {}
export interface UpdateProfileSuccessAction extends Action<typeof UPDATE_PROFILE_SUCCESS> {
  payload: UserProfile;
}
export interface UpdateProfileFailureAction extends Action<typeof UPDATE_PROFILE_FAILURE> {
  payload: string; // Error message
}

export interface SetUserTypeAction extends Action<typeof SET_USER_TYPE> {
  payload: UserPurposeType;
}

export interface CompleteOnboardingAction extends Action<typeof COMPLETE_ONBOARDING> {}

// Added for fetching profile
export interface FetchProfileRequestAction extends Action<typeof FETCH_PROFILE_REQUEST> {}
export interface FetchProfileSuccessAction extends Action<typeof FETCH_PROFILE_SUCCESS> {
  payload: UserProfile;
}
export interface FetchProfileFailureAction extends Action<typeof FETCH_PROFILE_FAILURE> {
  payload: string;
}


export type ProfileActionTypes =
  | UpdateProfileRequestAction | UpdateProfileSuccessAction | UpdateProfileFailureAction
  | SetUserTypeAction
  | CompleteOnboardingAction
  | FetchProfileRequestAction | FetchProfileSuccessAction | FetchProfileFailureAction;

// ThunkAction type
type AppThunk<ReturnType = void> = ThunkAction<Promise<AxiosResponse<any> | ReturnType>, RootState, unknown, ProfileActionTypes>;

// Fetches the full user profile (might be similar to getCurrentUser in authActions but specifically for profile state)
export const fetchProfile = (): AppThunk<AxiosResponse<UserProfile>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_PROFILE_REQUEST } as FetchProfileRequestAction);
    try {
      // Assuming apiClient.get('/profiles/me/') or a similar endpoint in your authAPI or a dedicated profileAPI
      // For now, let's use the existing GET_USER_SUCCESS logic from authAPI as an example path
      const response = await apiClient.get<UserProfile>('/users/me/'); // Or '/profiles/me/'
      dispatch({ type: FETCH_PROFILE_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch profile';
      dispatch({ type: FETCH_PROFILE_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};


export const updateProfile = (profileData: Partial<UserProfile>): AppThunk<AxiosResponse<UserProfile>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: UPDATE_PROFILE_REQUEST } as UpdateProfileRequestAction);
    try {
      // Assuming the API returns the updated UserProfile object
      const response = await apiClient.patch<UserProfile>('/profiles/me/', profileData);
      dispatch({
        type: UPDATE_PROFILE_SUCCESS,
        payload: response.data,
      });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      dispatch({ type: UPDATE_PROFILE_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};

export const setUserType = (userType: UserPurposeType): SetUserTypeAction => {
  return {
    type: SET_USER_TYPE,
    payload: userType,
  };
};

export const completeOnboarding = (): CompleteOnboardingAction => {
  return {
    type: COMPLETE_ONBOARDING,
  };
};

// Note: Ensure FETCH_PROFILE_REQUEST, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE
// are added to src/store/actions/types.ts file.

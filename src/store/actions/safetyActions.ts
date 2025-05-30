import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import apiClient from '../../api/auth'; // Assuming this is an AxiosInstance
import { AppDispatch, RootState } from '../index';
import { LocationCoords } from '../../utils/locationUtils'; // Assuming type from locationUtils
import { SafetySettingsData, BlockedUser } from '../../screens/profile/SafetyScreen'; // Types from SafetyScreen

import {
  REPORT_USER_REQUEST, REPORT_USER_SUCCESS, REPORT_USER_FAILURE,
  BLOCK_USER_REQUEST, BLOCK_USER_SUCCESS, BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST, UNBLOCK_USER_SUCCESS, UNBLOCK_USER_FAILURE, // For unblocking
  SHARE_LOCATION_REQUEST, SHARE_LOCATION_SUCCESS, SHARE_LOCATION_FAILURE,
  FETCH_SAFETY_SETTINGS_REQUEST, FETCH_SAFETY_SETTINGS_SUCCESS, FETCH_SAFETY_SETTINGS_FAILURE,
  UPDATE_SAFETY_SETTINGS_REQUEST, UPDATE_SAFETY_SETTINGS_SUCCESS, UPDATE_SAFETY_SETTINGS_FAILURE,
  FETCH_BLOCKED_USERS_REQUEST, FETCH_BLOCKED_USERS_SUCCESS, FETCH_BLOCKED_USERS_FAILURE,
} from './types'; // Ensure all these types are in types.ts

// Report User Actions
export interface ReportUserRequestAction extends Action<typeof REPORT_USER_REQUEST> {}
export interface ReportUserSuccessAction extends Action<typeof REPORT_USER_SUCCESS> {
  payload: { message: string }; // Or a more detailed response
}
export interface ReportUserFailureAction extends Action<typeof REPORT_USER_FAILURE> {
  payload: string;
}

// Block User Actions
export interface BlockUserRequestAction extends Action<typeof BLOCK_USER_REQUEST> {}
export interface BlockUserSuccessAction extends Action<typeof BLOCK_USER_SUCCESS> {
  payload: { blockedUserId: string | number }; // ID of the user successfully blocked
}
export interface BlockUserFailureAction extends Action<typeof BLOCK_USER_FAILURE> {
  payload: string;
}

// Unblock User Actions
export interface UnblockUserRequestAction extends Action<typeof UNBLOCK_USER_REQUEST> {}
export interface UnblockUserSuccessAction extends Action<typeof UNBLOCK_USER_SUCCESS> {
  payload: { unblockedUserId: string | number }; // ID of the user successfully unblocked
}
export interface UnblockUserFailureAction extends Action<typeof UNBLOCK_USER_FAILURE> {
  payload: string;
}

// Share Location Actions
export interface ShareLocationRequestAction extends Action<typeof SHARE_LOCATION_REQUEST> {}
export interface ShareLocationSuccessAction extends Action<typeof SHARE_LOCATION_SUCCESS> {
  payload: { meetingId: string | number; location: LocationCoords };
}
export interface ShareLocationFailureAction extends Action<typeof SHARE_LOCATION_FAILURE> {
  payload: string;
}

// Safety Settings Actions
export interface FetchSafetySettingsRequestAction extends Action<typeof FETCH_SAFETY_SETTINGS_REQUEST> {}
export interface FetchSafetySettingsSuccessAction extends Action<typeof FETCH_SAFETY_SETTINGS_SUCCESS> {
  payload: SafetySettingsData;
}
export interface FetchSafetySettingsFailureAction extends Action<typeof FETCH_SAFETY_SETTINGS_FAILURE> {
  payload: string;
}

export interface UpdateSafetySettingsRequestAction extends Action<typeof UPDATE_SAFETY_SETTINGS_REQUEST> {}
export interface UpdateSafetySettingsSuccessAction extends Action<typeof UPDATE_SAFETY_SETTINGS_SUCCESS> {
  payload: SafetySettingsData; // Return updated settings
}
export interface UpdateSafetySettingsFailureAction extends Action<typeof UPDATE_SAFETY_SETTINGS_FAILURE> {
  payload: string;
}

// Blocked Users List Actions
export interface FetchBlockedUsersRequestAction extends Action<typeof FETCH_BLOCKED_USERS_REQUEST> {}
export interface FetchBlockedUsersSuccessAction extends Action<typeof FETCH_BLOCKED_USERS_SUCCESS> {
  payload: BlockedUser[];
}
export interface FetchBlockedUsersFailureAction extends Action<typeof FETCH_BLOCKED_USERS_FAILURE> {
  payload: string;
}


export type SafetyActionTypes =
  | ReportUserRequestAction | ReportUserSuccessAction | ReportUserFailureAction
  | BlockUserRequestAction | BlockUserSuccessAction | BlockUserFailureAction
  | UnblockUserRequestAction | UnblockUserSuccessAction | UnblockUserFailureAction
  | ShareLocationRequestAction | ShareLocationSuccessAction | ShareLocationFailureAction
  | FetchSafetySettingsRequestAction | FetchSafetySettingsSuccessAction | FetchSafetySettingsFailureAction
  | UpdateSafetySettingsRequestAction | UpdateSafetySettingsSuccessAction | UpdateSafetySettingsFailureAction
  | FetchBlockedUsersRequestAction | FetchBlockedUsersSuccessAction | FetchBlockedUsersFailureAction;

// ThunkAction type
type AppThunk<ReturnType = void> = ThunkAction<Promise<AxiosResponse<any> | ReturnType>, RootState, unknown, SafetyActionTypes>;

export type ReportReasonType = 'inappropriate_behavior' | 'safety_concerns' | 'misrepresentation' | 'spam' | 'other';


export const reportUser = (userId: string | number, reason: ReportReasonType, comments?: string): AppThunk<AxiosResponse<{ message: string }>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: REPORT_USER_REQUEST });
    try {
      const response = await apiClient.post('/safety/report/', { reported_user_id: userId, reason, comments });
      dispatch({ type: REPORT_USER_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to report user';
      dispatch({ type: REPORT_USER_FAILURE, payload: msg });
      throw error;
    }
  };
};

export const blockUser = (userId: string | number): AppThunk<AxiosResponse<{ message: string }>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: BLOCK_USER_REQUEST });
    try {
      // Assuming API returns a success message along with possibly the ID of the blocked user record
      const response = await apiClient.post('/safety/block/', { blocked_user_id: userId });
      dispatch({ type: BLOCK_USER_SUCCESS, payload: { blockedUserId: userId } }); // Send ID back for potential UI update
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to block user';
      dispatch({ type: BLOCK_USER_FAILURE, payload: msg });
      throw error;
    }
  };
};

export const unblockUser = (userId: string | number): AppThunk<AxiosResponse<{ message: string }>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: UNBLOCK_USER_REQUEST });
    try {
      const response = await apiClient.post(`/safety/unblock/`, { user_id_to_unblock: userId }); // Endpoint and payload may vary
      dispatch({ type: UNBLOCK_USER_SUCCESS, payload: { unblockedUserId: userId }});
      // Optionally re-fetch blocked users list here or rely on component to do so
      dispatch(fetchBlockedUsers() as any); // Type assertion if dispatching another thunk
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to unblock user';
      dispatch({ type: UNBLOCK_USER_FAILURE, payload: msg });
      throw error;
    }
  };
};


// Simplified shareLocation, assumes location is obtained before calling
export const shareLocation = (meetingId: string | number, location: LocationCoords, shareDurationHours?: number): AppThunk<AxiosResponse<{ success: boolean; message?: string }>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: SHARE_LOCATION_REQUEST });
    try {
      const response = await apiClient.post('/safety/share_location/', { meeting_id: meetingId, location, duration_hours: shareDurationHours });
      dispatch({ type: SHARE_LOCATION_SUCCESS, payload: { meetingId, location } });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to share location';
      dispatch({ type: SHARE_LOCATION_FAILURE, payload: msg });
      throw error;
    }
  };
};

// Actions for Safety Settings
export const fetchSafetySettings = (): AppThunk<AxiosResponse<SafetySettingsData>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_SAFETY_SETTINGS_REQUEST });
    try {
      const response = await apiClient.get<SafetySettingsData>('/users/me/safety_settings/'); // Example endpoint
      dispatch({ type: FETCH_SAFETY_SETTINGS_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to fetch safety settings';
      dispatch({ type: FETCH_SAFETY_SETTINGS_FAILURE, payload: msg });
      throw error;
    }
  };
};

export const updateSafetySettings = (settings: Partial<SafetySettingsData>): AppThunk<AxiosResponse<SafetySettingsData>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: UPDATE_SAFETY_SETTINGS_REQUEST });
    try {
      const response = await apiClient.patch<SafetySettingsData>('/users/me/safety_settings/', settings); // Example endpoint
      dispatch({ type: UPDATE_SAFETY_SETTINGS_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to update safety settings';
      dispatch({ type: UPDATE_SAFETY_SETTINGS_FAILURE, payload: msg });
      throw error;
    }
  };
};

// Actions for Blocked Users List
export const fetchBlockedUsers = (): AppThunk<AxiosResponse<BlockedUser[]>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_BLOCKED_USERS_REQUEST });
    try {
      const response = await apiClient.get<BlockedUser[]>('/users/me/blocked_users/'); // Example endpoint
      dispatch({ type: FETCH_BLOCKED_USERS_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to fetch blocked users';
      dispatch({ type: FETCH_BLOCKED_USERS_FAILURE, payload: msg });
      throw error;
    }
  };
};

// Note: Ensure all new action type constants (UNBLOCK_USER_*, FETCH_SAFETY_SETTINGS_*, etc.)
// are added to src/store/actions/types.ts file.

import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import apiClient from '../../api/auth'; // Assuming apiClient can be used for these
import { PotentialMatch } from '../../screens/HomeScreen'; // Type for potential matches
import { MatchUserDetail } from '../../screens/matches/MatchDetailsScreen'; // Type for user details
import { Match, MatchStatus } from '../../screens/matches/MatchesScreen'; // Type for active matches

import { AppDispatch, RootState } from '../index';
import {
  FETCH_POTENTIAL_MATCHES_REQUEST, FETCH_POTENTIAL_MATCHES_SUCCESS, FETCH_POTENTIAL_MATCHES_FAILURE,
  FETCH_USER_DETAILS_REQUEST, FETCH_USER_DETAILS_SUCCESS, FETCH_USER_DETAILS_FAILURE,
  FETCH_MATCHES_REQUEST, FETCH_MATCHES_SUCCESS, FETCH_MATCHES_FAILURE,
  CREATE_MATCH_REQUEST, CREATE_MATCH_SUCCESS, CREATE_MATCH_FAILURE,
  RESPOND_TO_MATCH_REQUEST, RESPOND_TO_MATCH_SUCCESS, RESPOND_TO_MATCH_FAILURE,
} from './types';

// Action Interfaces
export interface FetchPotentialMatchesRequestAction extends Action<typeof FETCH_POTENTIAL_MATCHES_REQUEST> {}
export interface FetchPotentialMatchesSuccessAction extends Action<typeof FETCH_POTENTIAL_MATCHES_SUCCESS> {
  payload: PotentialMatch[];
}
export interface FetchPotentialMatchesFailureAction extends Action<typeof FETCH_POTENTIAL_MATCHES_FAILURE> {
  payload: string;
}

export interface FetchUserDetailsRequestAction extends Action<typeof FETCH_USER_DETAILS_REQUEST> {}
export interface FetchUserDetailsSuccessAction extends Action<typeof FETCH_USER_DETAILS_SUCCESS> {
  payload: MatchUserDetail; // Or a more generic UserProfile if applicable
}
export interface FetchUserDetailsFailureAction extends Action<typeof FETCH_USER_DETAILS_FAILURE> {
  payload: string;
}

export interface FetchMatchesRequestAction extends Action<typeof FETCH_MATCHES_REQUEST> {}
export interface FetchMatchesSuccessAction extends Action<typeof FETCH_MATCHES_SUCCESS> {
  payload: Match[]; // List of user's current matches
}
export interface FetchMatchesFailureAction extends Action<typeof FETCH_MATCHES_FAILURE> {
  payload: string;
}

export interface CreateMatchRequestAction extends Action<typeof CREATE_MATCH_REQUEST> {}
export interface CreateMatchSuccessAction extends Action<typeof CREATE_MATCH_SUCCESS> {
  payload: Match; // The newly created match or a success message
}
export interface CreateMatchFailureAction extends Action<typeof CREATE_MATCH_FAILURE> {
  payload: string;
}

export interface RespondToMatchRequestAction extends Action<typeof RESPOND_TO_MATCH_REQUEST> {}
export interface RespondToMatchSuccessAction extends Action<typeof RESPOND_TO_MATCH_SUCCESS> {
  payload: { matchId: string | number; newStatus: MatchStatus }; // ID of match and its new status
}
export interface RespondToMatchFailureAction extends Action<typeof RESPOND_TO_MATCH_FAILURE> {
  payload: string;
}


export type MatchActionTypes =
  | FetchPotentialMatchesRequestAction | FetchPotentialMatchesSuccessAction | FetchPotentialMatchesFailureAction
  | FetchUserDetailsRequestAction | FetchUserDetailsSuccessAction | FetchUserDetailsFailureAction
  | FetchMatchesRequestAction | FetchMatchesSuccessAction | FetchMatchesFailureAction
  | CreateMatchRequestAction | CreateMatchSuccessAction | CreateMatchFailureAction
  | RespondToMatchRequestAction | RespondToMatchSuccessAction | RespondToMatchFailureAction;

// ThunkAction type
type AppThunk<ReturnType = void, PayloadType = any> = ThunkAction<Promise<AxiosResponse<PayloadType> | ReturnType>, RootState, unknown, MatchActionTypes>;

// Action Creators
export const fetchPotentialMatches = (params?: any): AppThunk<void, PotentialMatch[]> => async dispatch => {
  dispatch({ type: FETCH_POTENTIAL_MATCHES_REQUEST });
  try {
    const response = await apiClient.get<PotentialMatch[]>('/matching/potential_matches/', { params });
    dispatch({ type: FETCH_POTENTIAL_MATCHES_SUCCESS, payload: response.data });
  } catch (error: any) {
    dispatch({ type: FETCH_POTENTIAL_MATCHES_FAILURE, payload: error.message || 'Failed to fetch potential matches' });
    throw error;
  }
};

export const fetchUserDetails = (userId: string | number): AppThunk<void, MatchUserDetail> => async dispatch => {
  dispatch({ type: FETCH_USER_DETAILS_REQUEST });
  try {
    const response = await apiClient.get<MatchUserDetail>(`/users/${userId}/profile/`); // Example endpoint
    dispatch({ type: FETCH_USER_DETAILS_SUCCESS, payload: response.data });
  } catch (error: any) {
    dispatch({ type: FETCH_USER_DETAILS_FAILURE, payload: error.message || 'Failed to fetch user details' });
    throw error;
  }
};

export const fetchMatches = (): AppThunk<void, Match[]> => async dispatch => {
  dispatch({ type: FETCH_MATCHES_REQUEST });
  try {
    const response = await apiClient.get<Match[]>('/matching/matches/'); // Example endpoint
    dispatch({ type: FETCH_MATCHES_SUCCESS, payload: response.data });
  } catch (error: any) {
    dispatch({ type: FETCH_MATCHES_FAILURE, payload: error.message || 'Failed to fetch matches' });
    throw error;
  }
};

export const createMatch = (responderId: string | number): AppThunk<void, Match> => async dispatch => {
  dispatch({ type: CREATE_MATCH_REQUEST });
  try {
    const response = await apiClient.post<Match>('/matching/matches/create_match/', { responder_id: responderId });
    dispatch({ type: CREATE_MATCH_SUCCESS, payload: response.data });
  } catch (error: any) {
    dispatch({ type: CREATE_MATCH_FAILURE, payload: error.message || 'Failed to create match' });
    throw error;
  }
};

export const respondToMatch = (matchId: string | number, responseType: 'accept' | 'reject'): AppThunk<void, { matchId: string | number; newStatus: MatchStatus }> => async dispatch => {
  dispatch({ type: RESPOND_TO_MATCH_REQUEST });
  try {
    const response = await apiClient.post<{ status: MatchStatus }>(`/matching/matches/${matchId}/respond/`, { response: responseType });
    dispatch({ type: RESPOND_TO_MATCH_SUCCESS, payload: { matchId, newStatus: response.data.status } });
  } catch (error: any) {
    dispatch({ type: RESPOND_TO_MATCH_FAILURE, payload: error.message || 'Failed to respond to match' });
    throw error;
  }
};

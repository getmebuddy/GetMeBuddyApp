import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import {
  companionshipAPI,
  CompanionFilters, // From src/api/companionship.ts
  CompanionshipRequestDetails, // From src/api/companionship.ts
  CompanionSummary, // For payload of GET_COMPANIONS_SUCCESS
  CompanionshipRequest, // For payload of REQUEST_COMPANIONSHIP_SUCCESS
} from '../../api/companionship';
import { AppDispatch, RootState } from '../index';

import {
  GET_COMPANIONS_REQUEST, GET_COMPANIONS_SUCCESS, GET_COMPANIONS_FAILURE,
  REQUEST_COMPANIONSHIP_REQUEST, REQUEST_COMPANIONSHIP_SUCCESS, REQUEST_COMPANIONSHIP_FAILURE,
} from './types';

// Action Interfaces
export interface GetCompanionsRequestAction extends Action<typeof GET_COMPANIONS_REQUEST> {}
export interface GetCompanionsSuccessAction extends Action<typeof GET_COMPANIONS_SUCCESS> {
  payload: CompanionSummary[]; // Array of companion summaries
}
export interface GetCompanionsFailureAction extends Action<typeof GET_COMPANIONS_FAILURE> {
  payload: string; // Error message
}

export interface RequestCompanionshipRequestAction extends Action<typeof REQUEST_COMPANIONSHIP_REQUEST> {}
export interface RequestCompanionshipSuccessAction extends Action<typeof REQUEST_COMPANIONSHIP_SUCCESS> {
  payload: CompanionshipRequest; // The created companionship request object
}
export interface RequestCompanionshipFailureAction extends Action<typeof REQUEST_COMPANIONSHIP_FAILURE> {
  payload: string; // Error message
}

export type CompanionshipActionTypes =
  | GetCompanionsRequestAction | GetCompanionsSuccessAction | GetCompanionsFailureAction
  | RequestCompanionshipRequestAction | RequestCompanionshipSuccessAction | RequestCompanionshipFailureAction;

// ThunkAction type
type AppThunk<ReturnType = void> = ThunkAction<Promise<AxiosResponse<any> | ReturnType>, RootState, unknown, CompanionshipActionTypes>;

export const getCompanions = (filters?: CompanionFilters): AppThunk<AxiosResponse<CompanionSummary[]>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: GET_COMPANIONS_REQUEST } as GetCompanionsRequestAction);
    try {
      const response = await companionshipAPI.getCompanions(filters);
      dispatch({
        type: GET_COMPANIONS_SUCCESS,
        payload: response.data, // Assuming API returns CompanionSummary[] directly in data
      });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch companions';
      dispatch({ type: GET_COMPANIONS_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};

export const requestCompanionship = (
  companionId: string | number,
  requestDetails: CompanionshipRequestDetails
): AppThunk<AxiosResponse<CompanionshipRequest>> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: REQUEST_COMPANIONSHIP_REQUEST } as RequestCompanionshipRequestAction);
    try {
      const response = await companionshipAPI.requestCompanionship(companionId, requestDetails);
      dispatch({
        type: REQUEST_COMPANIONSHIP_SUCCESS,
        payload: response.data, // Assuming API returns the created CompanionshipRequest
      });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to request companionship';
      dispatch({ type: REQUEST_COMPANIONSHIP_FAILURE, payload: errorMessage });
      throw error;
    }
  };
};

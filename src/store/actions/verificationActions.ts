import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { AxiosResponse } from 'axios';

import {
  verificationService,
  ImageFile, // Assuming ImageFile is { uri: string, name: string, type: string }
  SimpleVerificationResponse,
  IdentityVerificationResponse,
} from '../../services/VerificationService'; // Typed service
import { UserVerificationStatus } from '../../screens/verification/VerificationHomeScreen'; // Reusing type
import { AppDispatch, RootState } from '../index';

import {
  VERIFY_EMAIL_REQUEST, VERIFY_EMAIL_SUCCESS, VERIFY_EMAIL_FAILURE,
  REQUEST_EMAIL_CODE_REQUEST, REQUEST_EMAIL_CODE_SUCCESS, REQUEST_EMAIL_CODE_FAILURE, // For requesting code
  VERIFY_PHONE_REQUEST, VERIFY_PHONE_SUCCESS, VERIFY_PHONE_FAILURE,
  REQUEST_PHONE_CODE_REQUEST, REQUEST_PHONE_CODE_SUCCESS, REQUEST_PHONE_CODE_FAILURE, // For requesting code
  SUBMIT_PHOTO_REQUEST, SUBMIT_PHOTO_SUCCESS, SUBMIT_PHOTO_FAILURE, // For profile photo
  VERIFY_ID_REQUEST, VERIFY_ID_SUCCESS, VERIFY_ID_FAILURE, // For ID documents
  // Add other specific verification steps if needed (e.g., liveness, background check)
  GET_VERIFICATION_STATUS_REQUEST, GET_VERIFICATION_STATUS_SUCCESS, GET_VERIFICATION_STATUS_FAILURE,
} from './types'; // Ensure all these types are in types.ts

// Action Interfaces
export interface VerifyEmailRequestAction extends Action<typeof VERIFY_EMAIL_REQUEST> {}
export interface VerifyEmailSuccessAction extends Action<typeof VERIFY_EMAIL_SUCCESS> {
  payload: SimpleVerificationResponse; // Or updated UserVerificationStatus
}
export interface VerifyEmailFailureAction extends Action<typeof VERIFY_EMAIL_FAILURE> { payload: string; }

export interface RequestEmailCodeRequestAction extends Action<typeof REQUEST_EMAIL_CODE_REQUEST> {}
export interface RequestEmailCodeSuccessAction extends Action<typeof REQUEST_EMAIL_CODE_SUCCESS> { payload: { message: string } }
export interface RequestEmailCodeFailureAction extends Action<typeof REQUEST_EMAIL_CODE_FAILURE> { payload: string; }

export interface VerifyPhoneRequestAction extends Action<typeof VERIFY_PHONE_REQUEST> {}
export interface VerifyPhoneSuccessAction extends Action<typeof VERIFY_PHONE_SUCCESS> {
  payload: SimpleVerificationResponse; // Or updated UserVerificationStatus
}
export interface VerifyPhoneFailureAction extends Action<typeof VERIFY_PHONE_FAILURE> { payload: string; }

export interface RequestPhoneCodeRequestAction extends Action<typeof REQUEST_PHONE_CODE_REQUEST> {}
export interface RequestPhoneCodeSuccessAction extends Action<typeof REQUEST_PHONE_CODE_SUCCESS> { payload: { message: string } }
export interface RequestPhoneCodeFailureAction extends Action<typeof REQUEST_PHONE_CODE_FAILURE> { payload: string; }

export interface SubmitPhotoRequestAction extends Action<typeof SUBMIT_PHOTO_REQUEST> {}
export interface SubmitPhotoSuccessAction extends Action<typeof SUBMIT_PHOTO_SUCCESS> {
  payload: IdentityVerificationResponse; // Or updated UserVerificationStatus
}
export interface SubmitPhotoFailureAction extends Action<typeof SUBMIT_PHOTO_FAILURE> { payload: string; }

export interface VerifyIdRequestAction extends Action<typeof VERIFY_ID_REQUEST> {}
export interface VerifyIdSuccessAction extends Action<typeof VERIFY_ID_SUCCESS> {
  payload: IdentityVerificationResponse; // Or updated UserVerificationStatus
}
export interface VerifyIdFailureAction extends Action<typeof VERIFY_ID_FAILURE> { payload: string; }

export interface GetVerificationStatusRequestAction extends Action<typeof GET_VERIFICATION_STATUS_REQUEST> {}
export interface GetVerificationStatusSuccessAction extends Action<typeof GET_VERIFICATION_STATUS_SUCCESS> {
  payload: UserVerificationStatus;
}
export interface GetVerificationStatusFailureAction extends Action<typeof GET_VERIFICATION_STATUS_FAILURE> { payload: string; }


export type VerificationActionTypes =
  | VerifyEmailRequestAction | VerifyEmailSuccessAction | VerifyEmailFailureAction
  | RequestEmailCodeRequestAction | RequestEmailCodeSuccessAction | RequestEmailCodeFailureAction
  | VerifyPhoneRequestAction | VerifyPhoneSuccessAction | VerifyPhoneFailureAction
  | RequestPhoneCodeRequestAction | RequestPhoneCodeSuccessAction | RequestPhoneCodeFailureAction
  | SubmitPhotoRequestAction | SubmitPhotoSuccessAction | SubmitPhotoFailureAction
  | VerifyIdRequestAction | VerifyIdSuccessAction | VerifyIdFailureAction
  | GetVerificationStatusRequestAction | GetVerificationStatusSuccessAction | GetVerificationStatusFailureAction;

// ThunkAction type
type AppThunk<R = void, P = any> = ThunkAction<Promise<AxiosResponse<P> | R>, RootState, unknown, VerificationActionTypes>;


// --- Basic Verification Thunks ---
export const requestEmailVerificationCode = (email: string): AppThunk<{ message: string }> => async dispatch => {
  dispatch({ type: REQUEST_EMAIL_CODE_REQUEST });
  try {
    const response = await verificationService.requestEmailCode(email);
    dispatch({ type: REQUEST_EMAIL_CODE_SUCCESS, payload: response.data });
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to request email code';
    dispatch({ type: REQUEST_EMAIL_CODE_FAILURE, payload: msg });
    throw error;
  }
};

export const verifyEmail = (email: string, code: string): AppThunk<SimpleVerificationResponse> => async dispatch => {
  dispatch({ type: VERIFY_EMAIL_REQUEST });
  try {
    const response = await verificationService.verifyEmail(email, code);
    dispatch({ type: VERIFY_EMAIL_SUCCESS, payload: response.data });
    if (response.data.success) dispatch(getVerificationStatus() as any); // Re-fetch status
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Email verification failed';
    dispatch({ type: VERIFY_EMAIL_FAILURE, payload: msg });
    throw error;
  }
};

export const requestPhoneVerificationCode = (phone: string): AppThunk<{ message: string }> => async dispatch => {
  dispatch({ type: REQUEST_PHONE_CODE_REQUEST });
  try {
    const response = await verificationService.requestPhoneCode(phone);
    dispatch({ type: REQUEST_PHONE_CODE_SUCCESS, payload: response.data });
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Failed to request phone code';
    dispatch({ type: REQUEST_PHONE_CODE_FAILURE, payload: msg });
    throw error;
  }
};

export const verifyPhone = (phone: string, code: string): AppThunk<SimpleVerificationResponse> => async dispatch => {
  dispatch({ type: VERIFY_PHONE_REQUEST });
  try {
    const response = await verificationService.verifyPhone(phone, code);
    dispatch({ type: VERIFY_PHONE_SUCCESS, payload: response.data });
    if (response.data.success) dispatch(getVerificationStatus() as any); // Re-fetch status
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Phone verification failed';
    dispatch({ type: VERIFY_PHONE_FAILURE, payload: msg });
    throw error;
  }
};

export const submitPhotoForVerification = (photo: ImageFile): AppThunk<IdentityVerificationResponse> => async dispatch => {
  dispatch({ type: SUBMIT_PHOTO_REQUEST });
  try {
    const response = await verificationService.submitProfilePhoto(photo);
    dispatch({ type: SUBMIT_PHOTO_SUCCESS, payload: response.data });
    if (response.data.success || response.data.reviewStatus === 'pending') dispatch(getVerificationStatus() as any);
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Photo submission failed';
    dispatch({ type: SUBMIT_PHOTO_FAILURE, payload: msg });
    throw error;
  }
};

// --- Enhanced Verification Thunks ---
export const submitIdentityDocuments = (idImages: ImageFile[]): AppThunk<IdentityVerificationResponse> => async dispatch => {
  dispatch({ type: VERIFY_ID_REQUEST }); // Assuming VERIFY_ID is for document submission
  try {
    const response = await verificationService.submitIdentityDocuments(idImages);
    dispatch({ type: VERIFY_ID_SUCCESS, payload: response.data });
    if (response.data.success || response.data.reviewStatus === 'pending') dispatch(getVerificationStatus() as any);
    return response;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'ID document submission failed';
    dispatch({ type: VERIFY_ID_FAILURE, payload: msg });
    throw error;
  }
};

// --- Status Thunk ---
export const getVerificationStatus = (userId?: string | number): AppThunk<UserVerificationStatus> => {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: GET_VERIFICATION_STATUS_REQUEST });
    try {
      const response = await verificationService.getVerificationStatus(userId);
      dispatch({ type: GET_VERIFICATION_STATUS_SUCCESS, payload: response.data });
      return response;
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to get verification status';
      dispatch({ type: GET_VERIFICATION_STATUS_FAILURE, payload: msg });
      throw error;
    }
  };
};

// Note: Ensure all new action types (REQUEST_*_CODE_*, SUBMIT_PHOTO_*) are added to types.ts
// and that the verificationReducer handles these new actions.

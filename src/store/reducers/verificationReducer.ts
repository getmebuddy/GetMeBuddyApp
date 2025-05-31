import {
  VERIFY_EMAIL_REQUEST, VERIFY_EMAIL_SUCCESS, VERIFY_EMAIL_FAILURE,
  REQUEST_EMAIL_CODE_REQUEST, REQUEST_EMAIL_CODE_SUCCESS, REQUEST_EMAIL_CODE_FAILURE,
  VERIFY_PHONE_REQUEST, VERIFY_PHONE_SUCCESS, VERIFY_PHONE_FAILURE,
  REQUEST_PHONE_CODE_REQUEST, REQUEST_PHONE_CODE_SUCCESS, REQUEST_PHONE_CODE_FAILURE,
  SUBMIT_PHOTO_REQUEST, SUBMIT_PHOTO_SUCCESS, SUBMIT_PHOTO_FAILURE,
  VERIFY_ID_REQUEST, VERIFY_ID_SUCCESS, VERIFY_ID_FAILURE,
  GET_VERIFICATION_STATUS_REQUEST, GET_VERIFICATION_STATUS_SUCCESS, GET_VERIFICATION_STATUS_FAILURE,
} from '../actions/types';
import { VerificationActionTypes } from '../actions/verificationActions';
import { UserVerificationStatus } from '../../screens/verification/VerificationHomeScreen'; // Reusing type

// State Interface
export interface VerificationState {
  verificationStatus: UserVerificationStatus | null; // Can be null before first fetch
  loading: boolean; // Generic loading for most verification actions
  requestCodeLoading: { // Specific loading for code requests
    email: boolean;
    phone: boolean;
  };
  error: string | null; // Generic error
  requestCodeError: { // Specific errors for code requests
    email: string | null;
    phone: string | null;
  };
}

// Initial State
const initialState: VerificationState = {
  verificationStatus: null, // Initialize as null, will be populated by GET_VERIFICATION_STATUS_SUCCESS
  loading: false,
  requestCodeLoading: {
    email: false,
    phone: false,
  },
  error: null,
  requestCodeError: {
    email: null,
    phone: null,
  },
};

// Reducer Function
const verificationReducer = (
  state: VerificationState = initialState,
  action: VerificationActionTypes
): VerificationState => {
  switch (action.type) {
    case REQUEST_EMAIL_CODE_REQUEST:
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, email: true }, requestCodeError: { ...state.requestCodeError, email: null } };
    case REQUEST_EMAIL_CODE_SUCCESS: // Payload: { message: string }
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, email: false } };
    case REQUEST_EMAIL_CODE_FAILURE:
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, email: false }, requestCodeError: { ...state.requestCodeError, email: action.payload } };

    case REQUEST_PHONE_CODE_REQUEST:
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, phone: true }, requestCodeError: { ...state.requestCodeError, phone: null } };
    case REQUEST_PHONE_CODE_SUCCESS: // Payload: { message: string }
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, phone: false } };
    case REQUEST_PHONE_CODE_FAILURE:
      return { ...state, requestCodeLoading: { ...state.requestCodeLoading, phone: false }, requestCodeError: { ...state.requestCodeError, phone: action.payload } };

    case VERIFY_EMAIL_REQUEST:
    case VERIFY_PHONE_REQUEST:
    case SUBMIT_PHOTO_REQUEST:
    case VERIFY_ID_REQUEST: // ID Document submission
    case GET_VERIFICATION_STATUS_REQUEST:
      return { ...state, loading: true, error: null };

    // After individual verification successes, the full status is often re-fetched by the action thunk.
    // So, these success actions might just stop loading, or update a part of the status if the payload contains it.
    // For simplicity, we'll assume the payload of individual verify actions might update specific flags
    // and GET_VERIFICATION_STATUS_SUCCESS always provides the full, authoritative status.

    case VERIFY_EMAIL_SUCCESS: // Payload: SimpleVerificationResponse
      return {
        ...state,
        loading: false,
        verificationStatus: state.verificationStatus ? {
          ...state.verificationStatus,
          emailVerified: action.payload.success, // Or from action.payload.verificationStatus.emailVerified
          // level might change, typically re-fetched by getVerificationStatus()
        } : state.verificationStatus,
      };

    case VERIFY_PHONE_SUCCESS: // Payload: SimpleVerificationResponse
      return {
        ...state,
        loading: false,
        verificationStatus: state.verificationStatus ? {
          ...state.verificationStatus,
          phoneVerified: action.payload.success,
        } : state.verificationStatus,
      };

    case SUBMIT_PHOTO_SUCCESS: // Payload: IdentityVerificationResponse
    case VERIFY_ID_SUCCESS:    // Payload: IdentityVerificationResponse
      // If API returns partial status update or review status:
      const newStatus = action.payload.verificationStatus || {};
      if (action.payload.reviewStatus === 'approved') {
        if (action.type === SUBMIT_PHOTO_SUCCESS) newStatus.photoVerified = true;
        if (action.type === VERIFY_ID_SUCCESS) newStatus.idVerified = true;
      }
      return {
        ...state,
        loading: false,
        verificationStatus: state.verificationStatus ? { ...state.verificationStatus, ...newStatus } : null,
      };

    case GET_VERIFICATION_STATUS_SUCCESS: // Payload: UserVerificationStatus
      return {
        ...state,
        loading: false,
        verificationStatus: action.payload,
        error: null, // Clear previous general errors on successful status fetch
      };

    case VERIFY_EMAIL_FAILURE:
    case VERIFY_PHONE_FAILURE:
    case SUBMIT_PHOTO_FAILURE:
    case VERIFY_ID_FAILURE:
    case GET_VERIFICATION_STATUS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default verificationReducer;

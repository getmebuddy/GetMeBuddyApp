import {
  FETCH_PROFILE_REQUEST, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE, // Added for fetching profile
  UPDATE_PROFILE_REQUEST, UPDATE_PROFILE_SUCCESS, UPDATE_PROFILE_FAILURE,
  SET_USER_TYPE,
  COMPLETE_ONBOARDING,
} from '../actions/types'; // Ensure types.ts has FETCH_PROFILE actions
import { ProfileActionTypes, UserPurposeType } from '../actions/profileActions'; // Import union type and UserPurposeType
import { UserProfile } from '../../models/UserProfile';

// State Interface
export interface ProfileState {
  profileData: UserProfile | null; // Contains the full user profile object
  userType: UserPurposeType; // 'activity', 'companion', 'both', or null if not set
  onboardingCompleted: boolean;
  loading: boolean; // For fetching or updating profile
  error: string | null;
}

// Initial State
const initialState: ProfileState = {
  profileData: null,
  userType: null,
  onboardingCompleted: false,
  loading: false,
  error: null,
};

// Reducer Function
const profileReducer = (
  state: ProfileState = initialState,
  action: ProfileActionTypes
): ProfileState => {
  switch (action.type) {
    case FETCH_PROFILE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PROFILE_SUCCESS:
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profileData: action.payload, // payload is UserProfile
        loading: false,
        error: null,
        // Potentially infer onboardingCompleted or userType if profileData contains enough info
        // For example, if profileData has a field 'isOnboardingComplete'
        // onboardingCompleted: action.payload.isOnboardingComplete || state.onboardingCompleted,
      };

    case FETCH_PROFILE_FAILURE:
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload, // payload is string (error message)
      };

    case SET_USER_TYPE:
      return {
        ...state,
        userType: action.payload, // payload is UserPurposeType
      };

    case COMPLETE_ONBOARDING:
      return {
        ...state,
        onboardingCompleted: true,
      };

    default:
      return state;
  }
};

export default profileReducer;

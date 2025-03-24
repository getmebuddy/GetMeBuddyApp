// src/store/reducers/profileReducer.js
import {
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  SET_USER_TYPE,
  COMPLETE_ONBOARDING
} from '../actions/types';

const initialState = {
  profile: null,
  userType: null, // 'activity', 'companion', or 'both'
  onboardingCompleted: false,
  loading: false,
  error: null
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profile: action.payload,
        loading: false
      };
    
    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case SET_USER_TYPE:
      return {
        ...state,
        userType: action.payload
      };
      
    case COMPLETE_ONBOARDING:
      return {
        ...state,
        onboardingCompleted: true
      };
    
    default:
      return state;
  }
};

export default profileReducer;
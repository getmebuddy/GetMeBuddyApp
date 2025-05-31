import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  GET_USER_REQUEST, GET_USER_SUCCESS, GET_USER_FAILURE,
  SET_AUTH_STATE, // Added new action type
} from '../actions/types'; // Ensure SET_AUTH_STATE is in types.ts
import { AuthActionTypes, SetAuthStateAction } from '../actions/authActions'; // Import the union type and specific action if needed for payload
import { UserProfile } from '../../models/UserProfile'; // Use the model definition

// State Interface
// It's good practice to define this interface in a dedicated types file (e.g., store/types.ts or types/store.ts)
// if it's imported by other files (like RootState). For now, keeping it here.
export interface AuthState {
  user: UserProfile | null;
  token: string | null; // Added token field
  isAuthenticated: boolean; // Can be derived from token/user but often kept for convenience
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Reducer Function
const authReducer = (
  state: AuthState = initialState,
  action: AuthActionTypes | SetAuthStateAction // Include SetAuthStateAction in the union if not already part of AuthActionTypes
): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS: // Both actions have payload: { user: UserProfile; token: string }
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    
    case GET_USER_SUCCESS: // Payload is UserProfile
      return {
        ...state,
        loading: false,
        user: action.payload,
        // If a token exists, isAuthenticated should remain true.
        // If no token, this implies an issue or that GET_USER_SUCCESS should also provide a token.
        // For now, assume token presence means authenticated.
        isAuthenticated: !!state.token,
        error: null,
      };

    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_USER_FAILURE: // Payload is string (error message)
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null, // Clear user and token on critical failures
        token: null,
        isAuthenticated: false,
      };

    case LOGOUT:
      return {
        ...initialState, // Reset to initial state on logout
      };

    case SET_AUTH_STATE: // Payload is { user: UserProfile | null; token: string | null }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token && !!action.payload.user, // Or just !!action.payload.token
        loading: false, // Ensure loading is false after setting state
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;

// Note:
// 1. Ensure 'SET_AUTH_STATE' is added to types.ts.
// 2. Ensure AuthActionTypes in authActions.ts includes SetAuthStateAction or manually add it to the union type here.
//    It's better if AuthActionTypes from authActions.ts is comprehensive.
// 3. The logic for isAuthenticated in GET_USER_SUCCESS might need refinement
//    based on whether a token is guaranteed to be valid if user data is successfully fetched.

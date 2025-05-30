import {
  REPORT_USER_REQUEST, REPORT_USER_SUCCESS, REPORT_USER_FAILURE,
  BLOCK_USER_REQUEST, BLOCK_USER_SUCCESS, BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST, UNBLOCK_USER_SUCCESS, UNBLOCK_USER_FAILURE,
  SHARE_LOCATION_REQUEST, SHARE_LOCATION_SUCCESS, SHARE_LOCATION_FAILURE,
  FETCH_SAFETY_SETTINGS_REQUEST, FETCH_SAFETY_SETTINGS_SUCCESS, FETCH_SAFETY_SETTINGS_FAILURE,
  UPDATE_SAFETY_SETTINGS_REQUEST, UPDATE_SAFETY_SETTINGS_SUCCESS, UPDATE_SAFETY_SETTINGS_FAILURE,
  FETCH_BLOCKED_USERS_REQUEST, FETCH_BLOCKED_USERS_SUCCESS, FETCH_BLOCKED_USERS_FAILURE,
} from '../actions/types';
import { SafetyActionTypes } from '../actions/safetyActions';
import { SafetySettingsData, BlockedUser } from '../../screens/profile/SafetyScreen'; // Assuming types are defined here or in a model
import { LocationCoords } from '../../utils/locationUtils';

// State Interface
export interface SharedLocationEntry {
  meetingId: string | number;
  location: LocationCoords;
  timestamp: string; // ISO date string
}

export interface SafetyState {
  safetySettings: SafetySettingsData | null;
  blockedUsers: BlockedUser[] | null; // List of blocked user objects
  sharedLocations: SharedLocationEntry[]; // For active location shares by current user

  loadingSettings: boolean;
  loadingBlockedUsers: boolean;
  loadingAction: boolean; // For generic actions like report, block, share location
  error: string | null; // General error for actions
  settingsError: string | null;
  blockedUsersError: string | null;
}

// Initial State
const initialState: SafetyState = {
  safetySettings: null,
  blockedUsers: null,
  sharedLocations: [],
  loadingSettings: false,
  loadingBlockedUsers: false,
  loadingAction: false,
  error: null,
  settingsError: null,
  blockedUsersError: null,
};

// Reducer Function
const safetyReducer = (
  state: SafetyState = initialState,
  action: SafetyActionTypes
): SafetyState => {
  switch (action.type) {
    // Generic actions
    case REPORT_USER_REQUEST:
    case BLOCK_USER_REQUEST: // Handled by loadingAction
    case UNBLOCK_USER_REQUEST: // Handled by loadingBlockedUsers or a specific one if preferred
    case SHARE_LOCATION_REQUEST:
      return { ...state, loadingAction: true, error: null };

    case REPORT_USER_SUCCESS: // Payload is { message: string }
      return { ...state, loadingAction: false, error: null };

    case REPORT_USER_FAILURE:
    case BLOCK_USER_FAILURE: // Handled by error
    case UNBLOCK_USER_FAILURE:
    case SHARE_LOCATION_FAILURE:
      return { ...state, loadingAction: false, error: action.payload };

    // Block/Unblock specific logic
    case BLOCK_USER_SUCCESS: // Payload is { blockedUserId: string | number }
      // Add to blockedUsers list if not already present (though API call is source of truth)
      // Or simply rely on re-fetching the list via fetchBlockedUsers()
      return { ...state, loadingAction: false, error: null, /* consider re-fetching blocked users */ };

    case UNBLOCK_USER_SUCCESS: // Payload is { unblockedUserId: string | number }
      return {
        ...state,
        loadingAction: false, // Or a specific loading state for unblock
        error: null,
        blockedUsers: state.blockedUsers ? state.blockedUsers.filter(user => user.blocked_user_id !== action.payload.unblockedUserId) : null,
      };

    // Share Location
    case SHARE_LOCATION_SUCCESS: // Payload is { meetingId, location }
      return {
        ...state,
        loadingAction: false,
        sharedLocations: [
          ...state.sharedLocations,
          { ...action.payload, timestamp: new Date().toISOString() },
        ],
        error: null,
      };

    // Safety Settings
    case FETCH_SAFETY_SETTINGS_REQUEST:
    case UPDATE_SAFETY_SETTINGS_REQUEST:
      return { ...state, loadingSettings: true, settingsError: null };
    case FETCH_SAFETY_SETTINGS_SUCCESS:
    case UPDATE_SAFETY_SETTINGS_SUCCESS: // Payload is SafetySettingsData
      return { ...state, loadingSettings: false, safetySettings: action.payload, settingsError: null };
    case FETCH_SAFETY_SETTINGS_FAILURE:
    case UPDATE_SAFETY_SETTINGS_FAILURE:
      return { ...state, loadingSettings: false, settingsError: action.payload };

    // Blocked Users List
    case FETCH_BLOCKED_USERS_REQUEST:
      return { ...state, loadingBlockedUsers: true, blockedUsersError: null };
    case FETCH_BLOCKED_USERS_SUCCESS: // Payload is BlockedUser[]
      return { ...state, loadingBlockedUsers: false, blockedUsers: action.payload, blockedUsersError: null };
    case FETCH_BLOCKED_USERS_FAILURE:
      return { ...state, loadingBlockedUsers: false, blockedUsersError: action.payload };

    default:
      return state;
  }
};

export default safetyReducer;

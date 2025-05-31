import {
  FETCH_POTENTIAL_MATCHES_REQUEST, FETCH_POTENTIAL_MATCHES_SUCCESS, FETCH_POTENTIAL_MATCHES_FAILURE,
  FETCH_USER_DETAILS_REQUEST, FETCH_USER_DETAILS_SUCCESS, FETCH_USER_DETAILS_FAILURE, // For MatchDetailsScreen
  FETCH_MATCHES_REQUEST, FETCH_MATCHES_SUCCESS, FETCH_MATCHES_FAILURE, // For user's active matches
  CREATE_MATCH_REQUEST, CREATE_MATCH_SUCCESS, CREATE_MATCH_FAILURE, // For sending a match request
  RESPOND_TO_MATCH_REQUEST, RESPOND_TO_MATCH_SUCCESS, RESPOND_TO_MATCH_FAILURE, // For accepting/rejecting
} from '../actions/types'; // Ensure these are in types.ts
import { MatchActionTypes } from '../actions/matchActions'; // Import union type
import { PotentialMatch } from '../../screens/HomeScreen'; // Type for potential matches
import { MatchUserDetail } from '../../screens/matches/MatchDetailsScreen'; // Type for user details in matching context
import { Match } from '../../screens/matches/MatchesScreen'; // Type for active matches

// State Interface
export interface MatchState {
  potentialMatches: PotentialMatch[];
  matches: Match[]; // User's current (e.g., accepted, pending) matches
  userDetails: MatchUserDetail | null; // For viewing a specific user's profile in matching context
  loading: boolean;
  error: string | null;
  matchActionLoading: boolean; // For specific actions like create/respond
  matchActionError: string | null;
}

// Initial State
const initialState: MatchState = {
  potentialMatches: [],
  matches: [],
  userDetails: null,
  loading: false,
  error: null,
  matchActionLoading: false,
  matchActionError: null,
};

// Reducer Function
const matchReducer = (
  state: MatchState = initialState,
  action: MatchActionTypes // Use the union type for actions
): MatchState => {
  switch (action.type) {
    case FETCH_POTENTIAL_MATCHES_REQUEST:
    case FETCH_USER_DETAILS_REQUEST:
    case FETCH_MATCHES_REQUEST:
      return { ...state, loading: true, error: null };

    case CREATE_MATCH_REQUEST:
    case RESPOND_TO_MATCH_REQUEST:
      return { ...state, matchActionLoading: true, matchActionError: null };

    case FETCH_POTENTIAL_MATCHES_SUCCESS:
      return { ...state, loading: false, potentialMatches: action.payload, error: null };

    case FETCH_USER_DETAILS_SUCCESS:
      return { ...state, loading: false, userDetails: action.payload, error: null };

    case FETCH_MATCHES_SUCCESS:
      return { ...state, loading: false, matches: action.payload, error: null };

    case CREATE_MATCH_SUCCESS: // Payload could be the new match or just a success message
      // If payload is the new match, add it to potentialMatches or matches list
      // For now, just stop loading. Actual list updates might need more specific logic or re-fetching.
      return { ...state, matchActionLoading: false, matchActionError: null };

    case RESPOND_TO_MATCH_SUCCESS:
      // Update the status of the specific match in either 'matches' or 'potentialMatches' list
      const { matchId, newStatus } = action.payload; // Assuming payload has matchId and newStatus
      return {
        ...state,
        matchActionLoading: false,
        matchActionError: null,
        matches: state.matches.map(m => m.id === matchId ? { ...m, status: newStatus } : m),
        potentialMatches: state.potentialMatches.map(pm =>
            (pm.user_id === matchId && pm.scores) // Assuming potentialMatch user_id can be a matchId
            ? { ...pm, status: newStatus } // This is a simplification; potentialMatches might not have a status field
            : pm
        ),
      };

    case FETCH_POTENTIAL_MATCHES_FAILURE:
    case FETCH_USER_DETAILS_FAILURE:
    case FETCH_MATCHES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_MATCH_FAILURE:
    case RESPOND_TO_MATCH_FAILURE:
      return { ...state, matchActionLoading: false, matchActionError: action.payload };

    default:
      return state;
  }
};

export default matchReducer;

// Note:
// - Ensure all action types used here are defined in '../actions/types.ts'.
// - Ensure all action interfaces and the MatchActionTypes union are correctly defined in '../actions/matchActions.ts'.
// - The structure of `PotentialMatch` and `Match` should align with what the API returns and what components expect.
// - `CREATE_MATCH_SUCCESS` and `RESPOND_TO_MATCH_SUCCESS` might need more sophisticated logic for updating lists
//   (e.g., removing a potential match if a request is sent, updating a match status from pending to accepted).
//   Often, re-fetching the list or relevant item is a simpler approach.

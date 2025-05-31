import {
  GET_COMPANIONS_REQUEST, GET_COMPANIONS_SUCCESS, GET_COMPANIONS_FAILURE,
  REQUEST_COMPANIONSHIP_REQUEST, REQUEST_COMPANIONSHIP_SUCCESS, REQUEST_COMPANIONSHIP_FAILURE,
} from '../actions/types';
import { CompanionshipActionTypes } from '../actions/companionshipActions'; // Import the union type
import { CompanionSummary, CompanionshipRequest } from '../../api/companionship'; // Import models/types

// State Interface
export interface CompanionshipState {
  companions: CompanionSummary[];
  companionshipRequests: CompanionshipRequest[]; // Stores requests initiated by the user
  // Could also add: receivedCompanionshipRequests: CompanionshipRequest[]; for requests received by user
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: CompanionshipState = {
  companions: [],
  companionshipRequests: [],
  loading: false,
  error: null,
};

// Reducer Function
const companionshipReducer = (
  state: CompanionshipState = initialState,
  action: CompanionshipActionTypes
): CompanionshipState => {
  switch (action.type) {
    case GET_COMPANIONS_REQUEST:
    case REQUEST_COMPANIONSHIP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_COMPANIONS_SUCCESS:
      return {
        ...state,
        companions: action.payload, // payload is CompanionSummary[]
        loading: false,
        error: null,
      };

    case REQUEST_COMPANIONSHIP_SUCCESS:
      return {
        ...state,
        // Add the new request to the list of requests made by the user
        companionshipRequests: [...state.companionshipRequests, action.payload], // payload is CompanionshipRequest
        loading: false,
        error: null,
      };

    case GET_COMPANIONS_FAILURE:
    case REQUEST_COMPANIONSHIP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload, // payload is string (error message)
      };

    default:
      return state;
  }
};

export default companionshipReducer;

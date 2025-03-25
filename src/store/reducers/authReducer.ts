// src/store/reducers/authReducer.ts
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE
} from '../actions/types';
import { AuthState } from '../../types/store';
import { User } from '../../types/models';
import { AppAction } from '../../types/store';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

type AuthAction = 
  | AppAction<typeof LOGIN_REQUEST>
  | AppAction<typeof LOGIN_SUCCESS, User>
  | AppAction<typeof LOGIN_FAILURE, string>
  | AppAction<typeof LOGOUT>
  | AppAction<typeof REGISTER_REQUEST>
  | AppAction<typeof REGISTER_SUCCESS, User>
  | AppAction<typeof REGISTER_FAILURE, string>
  | AppAction<typeof GET_USER_REQUEST>
  | AppAction<typeof GET_USER_SUCCESS, User>
  | AppAction<typeof GET_USER_FAILURE, string>;

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case GET_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
    case GET_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case GET_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    
    case LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null
      };
    
    default:
      return state;
  }
};

export default authReducer;
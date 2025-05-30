import authReducer, { AuthState } from '../../../src/store/reducers/authReducer'; // Assuming AuthState is exported from the reducer file
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST, // Assuming these are used or will be
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  // It's good practice to have a union type for all possible auth actions
  // AuthActionTypes, // Example: import { AuthActionTypes } from '../../../src/store/actions/authActions';
} from '../../../src/store/actions/types'; // Assuming action type constants are in 'types.ts'
import { User } from '../../../src/models/UserProfile'; // Assuming User type path
import { AnyAction } from 'redux'; // Base type for actions if specific action types are not used for each case

describe('Auth Reducer', () => {
  // Use the exported AuthState type for the initial state
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false, // Match the reducer's initialState
    loading: false,
    error: null,
  };

  it('should return the initial state for an unknown action', () => {
    expect(authReducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it('should handle LOGIN_REQUEST', () => {
    const action: AnyAction = { type: LOGIN_REQUEST };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      isAuthenticated: false, // Ensure this is part of the expected state if initialState has it
      loading: true,
      error: null,
    });
  });

  it('should handle LOGIN_SUCCESS', () => {
    const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockToken = 'fake-access-token';
    // This should match the payload structure from your LOGIN_SUCCESS action creator
    const action: AnyAction = { // Or a more specific action type e.g. LoginSuccessAction
      type: LOGIN_SUCCESS,
      payload: { user: mockUser, token: mockToken },
    };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      user: mockUser,
      token: mockToken,
      isAuthenticated: true, // LOGIN_SUCCESS sets this to true
      error: null,
    });
  });

  it('should handle LOGIN_FAILURE', () => {
    const errorMessage = 'Invalid credentials';
    const action: AnyAction = { // Or LoginFailureAction
      type: LOGIN_FAILURE,
      payload: errorMessage,
    };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      error: errorMessage,
      user: null,
      token: null,
      isAuthenticated: false, // LOGIN_FAILURE sets this to false
    });
  });

  it('should handle LOGOUT', () => {
    const loggedInState: AuthState = { // This state should also include isAuthenticated
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'fake-access-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    const action: AnyAction = { type: LOGOUT }; // Or LogoutAction
    expect(authReducer(loggedInState, action)).toEqual(initialState); // LOGOUT resets to the exact initialState
  });

  // Example tests for registration actions (if applicable)
  it('should handle REGISTER_REQUEST', () => {
    const action: AnyAction = { type: REGISTER_REQUEST };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      isAuthenticated: false, // Ensure this is part of the expected state
      loading: true,
      error: null,
    });
  });

  it('should handle REGISTER_SUCCESS', () => {
    const mockUser: User = { id: '2', email: 'new@example.com', name: 'New User' };
    const mockToken = 'new-fake-access-token';
    const action: AnyAction = {
      type: REGISTER_SUCCESS,
      payload: { user: mockUser, token: mockToken },
    };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      user: mockUser,
      token: mockToken,
      isAuthenticated: true, // REGISTER_SUCCESS sets this to true
      error: null,
    });
  });

  it('should handle REGISTER_FAILURE', () => {
    const errorMessage = 'Registration failed';
    const action: AnyAction = {
      type: REGISTER_FAILURE,
      payload: errorMessage,
    };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
      loading: false,
      error: errorMessage,
      user: null,
      token: null,
      isAuthenticated: false, // REGISTER_FAILURE sets this to false
    });
  });
});

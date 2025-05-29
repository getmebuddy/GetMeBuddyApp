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
    token: null, // Added token to AuthState based on common patterns
    loading: false,
    error: null,
    // isAuthenticated is often derived from token or user, so might not be in state directly
    // or handled by a selector. If it's part of state, ensure it's in AuthState type.
  };

  it('should return the initial state for an unknown action', () => {
    expect(authReducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it('should handle LOGIN_REQUEST', () => {
    const action: AnyAction = { type: LOGIN_REQUEST };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
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
      user: null, // Ensure user and token are cleared on failure
      token: null,
    });
  });

  it('should handle LOGOUT', () => {
    const loggedInState: AuthState = {
      ...initialState,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      token: 'fake-access-token',
    };
    const action: AnyAction = { type: LOGOUT }; // Or LogoutAction
    expect(authReducer(loggedInState, action)).toEqual({
      ...initialState, // Resets to the initial state (user: null, token: null, etc.)
    });
  });

  // Example tests for registration actions (if applicable)
  it('should handle REGISTER_REQUEST', () => {
    const action: AnyAction = { type: REGISTER_REQUEST };
    expect(authReducer(initialState, action)).toEqual({
      ...initialState,
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
    });
  });
});

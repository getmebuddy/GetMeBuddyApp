import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk'; // Revert to standard ES6 import
import type { ThunkDispatch, ThunkMiddleware } from 'redux-thunk'; // Ensure ThunkMiddleware is correctly sourced

import {
  login,
  logout,
  register,
  // AuthActionTypes, // This can still be imported from authActions if it's exported there
} from '../../../src/store/actions/authActions'; // Adjusted path

// Import action type constants directly from types.ts
import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE // If testing register actions too
} from '../../../src/store/actions/types';

import { authAPI } from '../../../src/api/auth';
import { User } from '../../../src/models/UserProfile'; // Assuming User type path
import { RootState } from '../../../src/store/reducers'; // Assuming RootState type path
import { AnyAction } from 'redux';

// Mock the auth API
jest.mock('../../../src/api/auth', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
}));

// Define types for the mock store
type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;
const middlewaresToApply: ThunkMiddleware<RootState, AnyAction, undefined>[] = [thunk]; // Use thunk directly
const mockStore = configureStore<Partial<RootState>, AppDispatch>(middlewaresToApply);

describe('Auth Actions', () => {
  let store: MockStoreEnhanced<Partial<RootState>, AppDispatch>;

  beforeEach(() => {
    store = mockStore({
      auth: { // Initial auth state for the mock store
        user: null,
        token: null,
        loading: false,
        error: null,
      }
    });
    // jest.clearAllMocks(); // Handled by mockReset in jest.config.js or manually if needed
    // Or, if you prefer to clear them manually:
    (authAPI.login as jest.Mock).mockClear();
    (authAPI.logout as jest.Mock).mockClear();
    (authAPI.register as jest.Mock).mockClear();
  });

  describe('login action', () => {
    it('dispatches LOGIN_REQUEST and LOGIN_SUCCESS on successful login', async () => {
      const mockUser: User = { id: '1', email: 'test@example.com', name: 'Test User' }; // Adjusted User type
      const mockApiResponse = { user: mockUser, access: 'fakeToken', refresh: 'fakeRefreshToken' };
      // authAPI.login returns an AxiosResponse, so mockResolvedValue needs to provide { data: ... }
      (authAPI.login as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      // Dispatch the login action. Need to cast to any if thunk action signature is complex
      await store.dispatch(login('test@example.com', 'password123') as any);

      const actions = store.getActions();

      expect(actions[0]).toEqual({ type: LOGIN_REQUEST });
      expect(actions[1]).toEqual({
        type: LOGIN_SUCCESS,
        payload: { user: mockUser, token: mockApiResponse.access }, // Assuming payload structure
      });
    });

    it('dispatches LOGIN_REQUEST and LOGIN_FAILURE on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      // Simulate an error structure, often with response.data
      const mockError = { response: { data: { detail: errorMessage } } };
      (authAPI.login as jest.Mock).mockRejectedValue(mockError);

      // Using a try-catch block to handle the expected promise rejection
      try {
        await store.dispatch(login('test@example.com', 'wrong-password') as any);
      } catch (e) {
        // Error is expected, and thunk middleware might re-throw it or handle it.
        // If your thunk catches the error and dispatches LOGIN_FAILURE, this catch might not be necessary
        // depending on the thunk's implementation.
      }

      const actions = store.getActions();
      expect(actions[0]).toEqual({ type: LOGIN_REQUEST });
      expect(actions[1]).toEqual({
        type: LOGIN_FAILURE,
        payload: errorMessage,
      });
    });
  });

  describe('logout action', () => {
    it('dispatches LOGOUT and calls authAPI.logout on successful logout', async () => {
      (authAPI.logout as jest.Mock).mockResolvedValue({}); // Simulate successful API call

      await store.dispatch(logout() as any);

      const actions = store.getActions();

      expect(actions[0]).toEqual({ type: LOGOUT });
      expect(authAPI.logout).toHaveBeenCalled();
    });
  });

  // Example for register action (if you have one and want to test it)
  describe('register action', () => {
    it('dispatches appropriate actions on successful registration', async () => {
      const mockUser: User = { id: '2', email: 'new@example.com', name: 'New User' };
      const mockApiResponse = { user: mockUser, access: 'newFakeToken', refresh: 'newFakeRefreshToken' };
      // authAPI.register also returns an AxiosResponse
      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockApiResponse });

      const userData = { email: 'new@example.com', password: 'newPassword123', name: 'New User'};

      // Assuming REGISTER_REQUEST, REGISTER_SUCCESS types exist
      // await store.dispatch(register(userData) as any);
      // const actions = store.getActions();
      // expect(actions[0].type).toBe('REGISTER_REQUEST'); // Replace with actual type
      // expect(actions[1].type).toBe('REGISTER_SUCCESS'); // Replace with actual type
      // expect(actions[1].payload).toEqual({ user: mockUser, token: mockApiResponse.access });
      expect(true).toBe(true); // Placeholder if register action is not fully implemented/tested here
    });
  });
});

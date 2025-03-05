import authReducer from '../../../src/store/reducers/authReducer';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE
} from '../../../store/actions/authActions';

describe('Auth Reducer', () => {
  const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false
  };
  
  it('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });
  
  it('should handle LOGIN_REQUEST', () => {
    expect(
      authReducer(initialState, {
        type: LOGIN_REQUEST
      })
    ).toEqual({
      ...initialState,
      loading: true,
      error: null
    });
  });
  
  it('should handle LOGIN_SUCCESS', () => {
    const user = { id: 1, email: 'test@example.com' };
    
    expect(
      authReducer(initialState, {
        type: LOGIN_SUCCESS,
        payload: user
      })
    ).toEqual({
      ...initialState,
      loading: false,
      user: user,
      isAuthenticated: true,
      error: null
    });
  });
  
  it('should handle LOGIN_FAILURE', () => {
    const error = 'Invalid credentials';
    
    expect(
      authReducer(initialState, {
        type: LOGIN_FAILURE,
        payload: error
      })
    ).toEqual({
      ...initialState,
      loading: false,
      error: error,
      isAuthenticated: false
    });
  });
  
  it('should handle LOGOUT', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, email: 'test@example.com' },
      isAuthenticated: true
    };
    
    expect(
      authReducer(loggedInState, {
        type: LOGOUT
      })
    ).toEqual({
      ...initialState,
      user: null,
      isAuthenticated: false,
      error: null
    });
  });
});
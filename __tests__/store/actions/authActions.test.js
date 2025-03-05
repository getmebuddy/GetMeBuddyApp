import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { 
  login, 
  logout, 
  register, 
  LOGIN_REQUEST, 
  LOGIN_SUCCESS, 
  LOGIN_FAILURE,
  LOGOUT
} from '../../../store/actions/authActions';
import { authAPI } from '../../../src/api/auth';

// Mock the auth API
jest.mock('../../../src/api/auth', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  }
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Auth Actions', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });
  
  it('creates LOGIN_SUCCESS when login is successful', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockResponse = { data: { user: mockUser } };
    
    authAPI.login.mockResolvedValue(mockResponse);
    
    await store.dispatch(login('test@example.com', 'password123'));
    
    const actions = store.getActions();
    
    expect(actions[0]).toEqual({ type: LOGIN_REQUEST });
    expect(actions[1]).toEqual({ 
      type: LOGIN_SUCCESS, 
      payload: mockUser 
    });
  });
  
  it('creates LOGIN_FAILURE when login fails', async () => {
    const mockError = { response: { data: { detail: 'Invalid credentials' } } };
    
    authAPI.login.mockRejectedValue(mockError);
    
    try {
      await store.dispatch(login('test@example.com', 'wrong-password'));
    } catch (error) {
      // Expected error
    }
    
    const actions = store.getActions();
    
    expect(actions[0]).toEqual({ type: LOGIN_REQUEST });
    expect(actions[1]).toEqual({ 
      type: LOGIN_FAILURE, 
      payload: 'Invalid credentials' 
    });
  });
  
  it('creates LOGOUT when logout is successful', async () => {
    await store.dispatch(logout());
    
    const actions = store.getActions();
    
    expect(actions[0]).toEqual({ type: LOGOUT });
    expect(authAPI.logout).toHaveBeenCalled();
  });
});
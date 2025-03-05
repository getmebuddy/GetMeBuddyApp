import { authAPI } from '../../../src/api/auth';
import fetchMock from 'jest-fetch-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Auth API', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });
  
  it('should register a user successfully', async () => {
    const mockResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      },
      refresh: 'refresh-token',
      access: 'access-token'
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    
    const userData = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      password: 'password123',
      password_confirm: 'password123'
    };
    
    const response = await authAPI.register(userData);
    
    expect(response.data).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/register/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(userData)
      })
    );
  });
  
  it('should login a user and store tokens', async () => {
    const mockResponse = {
      user: {
        id: 1,
        email: 'test@example.com'
      },
      refresh: 'refresh-token',
      access: 'access-token'
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    
    await authAPI.login('test@example.com', 'password123');
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
  });
  
  it('should logout a user and remove tokens', async () => {
    await authAPI.logout();
    
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
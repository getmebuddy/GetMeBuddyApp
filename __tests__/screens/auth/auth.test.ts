import { authAPI, UserRegistrationData, UserLoginData, AuthResponse, User } from '../../../src/api/auth'; // Assuming types are exported from auth API module
import fetchMock from 'jest-fetch-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable fetch mocks
fetchMock.enableMocks();

// Define a more specific type for the user in mock responses if not fully covered by User type from auth.ts
interface MockUser extends User {
  first_name?: string;
  last_name?: string;
}

interface MockAuthResponse extends AuthResponse {
  user: MockUser;
}

describe('Auth API', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    // jest.clearAllMocks(); // Not needed usually with resetMocks for fetch, AsyncStorage is auto-mocked by setup
  });

  it('should register a user successfully', async () => {
    const mockApiResponse: MockAuthResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      },
      refresh: 'refresh-token',
      access: 'access-token',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));

    const userData: UserRegistrationData = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      password: 'password123',
      password_confirm: 'password123',
    };

    // authAPI.register is expected to return a specific structure, often { data: ActualResponse } if using axios or similar
    // For this example, let's assume authAPI.register directly returns the data part of the response or is adapted.
    // If authAPI.register returns { data: ... }, then expect(response.data) should be expect(response.data.data) or similar.
    // Let's assume authAPI.register is modified or designed to return the JSON directly for simplicity in this mock.
    const response = await authAPI.register(userData);

    // If authAPI.register returns the parsed JSON directly:
    expect(response).toEqual(mockApiResponse); 
    // If authAPI.register returns an object like { data: mockApiResponse }:
    // expect(response.data).toEqual(mockApiResponse);


    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/register/'), // Or the exact URL if known
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
    );
  });

  it('should login a user and store tokens', async () => {
    const mockLoginResponse: AuthResponse = { // Use AuthResponse if user details are not critical or different from User type
      user: { // Assuming User type from auth.ts is { id: number; email: string; }
        id: 1,
        email: 'test@example.com',
      },
      refresh: 'refresh-token',
      access: 'access-token',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockLoginResponse));

    const loginData: UserLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    
    // Assuming authAPI.login also returns the parsed JSON directly or handles the 'data' property internally.
    await authAPI.login(loginData.email, loginData.password);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/login/'), // Or the exact URL
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
    );
  });

  it('should logout a user and remove tokens', async () => {
    // Mock the /users/logout/ endpoint if it's called by authAPI.logout
    // For example, if it expects a POST request and returns a 200/204 status
    fetchMock.mockResponseOnce('', { status: 204 });

    await authAPI.logout();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    
    // Example: Check if fetch was called for logout, if applicable
    // expect(fetchMock).toHaveBeenCalledWith(
    //   expect.stringContaining('/users/logout/'),
    //   expect.objectContaining({
    //     method: 'POST', // or 'GET', depending on your API
    //   })
    // );
  });
});

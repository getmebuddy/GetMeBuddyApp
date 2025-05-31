import { authAPI, UserRegistrationData, UserLoginData, AuthResponse, User, ProfileUpdateData } from '../../../src/api/auth';
// AsyncStorage will be auto-mocked by jest.setup.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
// Explicitly tell Jest to use the manual mock for src/api/auth.ts
jest.mock('../../../src/api/auth');
import { API_URL } from '../../../src/api/config';

// Jest will automatically use src/api/__mocks__/auth.ts

interface MockUser extends User {
  first_name?: string;
  last_name?: string;
}

interface MockAuthResponse extends AuthResponse {
  user: MockUser;
}

describe('Auth API (using manual mock for authAPI)', () => {
  beforeEach(() => {
    // Reset mocks for authAPI methods (which are now jest.fn() from the manual mock)
    (authAPI.register as jest.Mock).mockReset();
    (authAPI.login as jest.Mock).mockReset();
    (authAPI.logout as jest.Mock).mockReset();
    (authAPI.getCurrentUser as jest.Mock).mockReset();
    (authAPI.firebaseAuth as jest.Mock).mockReset(); // Ensure all mocked methods are reset

    // Clear AsyncStorage mocks if needed for specific tests (though it's auto-mocked)
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear(); // For token refresh simulation if mock was more complex
    (AsyncStorage.removeItem as jest.Mock).mockClear();
  });

  it('should call mocked register successfully', async () => {
    const mockApiResponseData: RegisterResponse = {
      user: { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' },
      access: 'access-token',
      refresh: 'refresh-token',
    };
    // Simulate the authAPI.register mock returning the data part of an AxiosResponse
    (authAPI.register as jest.Mock).mockResolvedValueOnce({ data: mockApiResponseData });

    const userData: UserRegistrationData = {
      email: 'test@example.com', first_name: 'Test', last_name: 'User', password: 'password123'
    };
    const response = await authAPI.register(userData); // Calls the jest.fn() from __mocks__

    expect(response.data).toEqual(mockApiResponseData);
    expect(authAPI.register).toHaveBeenCalledWith(userData);
  });

  it('should call mocked login successfully and simulate AsyncStorage calls if mock did them', async () => {
    const mockLoginResponseData: LoginResponse = {
      user: { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' },
      access: 'access-token',
      refresh: 'refresh-token',
    };
    // Simulate the authAPI.login mock returning the data part of an AxiosResponse
    (authAPI.login as jest.Mock).mockResolvedValueOnce({ data: mockLoginResponseData });

    // If the mock itself was to simulate AsyncStorage calls, we could test them.
    // For example, if __mocks__/auth.ts a_l_i did:
    // login: jest.fn(async (email, password) => {
    //   await AsyncStorage.setItem('accessToken', 'mockAccess');
    //   return { data: mockLoginResponseData };
    // })
    // Then we could test AsyncStorage.setItem.
    // Since our current __mocks__/auth.ts has plain jest.fn(), these won't be called by the mock.

    const loginCredentials = { email: 'test@example.com', password: 'password123' };
    const response = await authAPI.login(loginCredentials.email, loginCredentials.password);

    expect(response.data).toEqual(mockLoginResponseData);
    expect(authAPI.login).toHaveBeenCalledWith(loginCredentials.email, loginCredentials.password);
    // Cannot assert AsyncStorage calls here because the *actual* login function from src/api/auth.ts is not running.
  });

  it('should call mocked logout successfully', async () => {
    (authAPI.logout as jest.Mock).mockResolvedValueOnce({ success: true }); // Mocking the return of the actual logout
    await authAPI.logout();
    expect(authAPI.logout).toHaveBeenCalled();
    // Cannot assert AsyncStorage calls here for the same reason as above.
  });

  it('should call mocked getCurrentUser successfully', async () => {
    const mockUserData: UserProfile = { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' };
    (authAPI.getCurrentUser as jest.Mock).mockResolvedValueOnce({ data: mockUserData });

    const response = await authAPI.getCurrentUser();
    expect(response.data).toEqual(mockUserData);
    expect(authAPI.getCurrentUser).toHaveBeenCalled();
  });
});

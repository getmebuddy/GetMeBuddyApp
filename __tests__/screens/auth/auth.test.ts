import { authAPI, UserRegistrationData, UserLoginData, AuthResponse, User, ProfileUpdateData } from '../../../src/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../src/api/config'; // For checking refresh call

// --- Axios Mock ---
const mockApiPost = jest.fn();
const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();
const mockRequestInterceptorUse = jest.fn();
const mockResponseInterceptorUse = jest.fn();

const mockAxiosInstance = {
  interceptors: {
    request: { use: mockRequestInterceptorUse, eject: jest.fn() },
    response: { use: mockResponseInterceptorUse, eject: jest.fn() },
  },
  get: mockApiGet,
  post: mockApiPost,
  patch: mockApiPatch,
  delete: mockApiDelete,
};

const mockAxiosCreate = jest.fn(() => mockAxiosInstance);
const mockStaticPost = jest.fn(); // For mocking axios.post (used in token refresh)
const mockStaticIsAxiosError = jest.fn((payload: any): payload is import('axios').AxiosError => !!payload && payload.isAxiosError === true);


jest.mock('axios', () => {
  const actualAxiosModule = {
    create: mockAxiosCreate,
    post: mockStaticPost,
    get: jest.fn(), // Add other static methods if used by main code
    isAxiosError: mockStaticIsAxiosError,
  };
  return {
    __esModule: true, // Needed for Babel's interop for `import axios from 'axios'`
    default: actualAxiosModule,
    ...actualAxiosModule, // Spread to cover cases where interop might not add .default
  };
});
// --- End Axios Mock ---

interface MockUser extends User {
  first_name?: string;
  last_name?: string;
}

interface MockAuthResponse extends AuthResponse {
  user: MockUser;
}

describe('Auth API', () => {
  beforeEach(() => {
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
    mockApiDelete.mockReset();
    mockRequestInterceptorUse.mockReset();
    mockResponseInterceptorUse.mockReset();
    mockAxiosCreate.mockClear();
    mockStaticPost.mockReset();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
  });

  it('should create an apiClient with interceptors when module loads', () => {
    // The import of authAPI at the top of the file already causes src/api/auth.ts to load.
    // This test verifies that axios.create and interceptor setup occurred during that load.
    expect(mockAxiosCreate).toHaveBeenCalled();
    expect(mockRequestInterceptorUse).toHaveBeenCalled();
    expect(mockResponseInterceptorUse).toHaveBeenCalled();
  });

  it('should register a user successfully', async () => {
    const mockApiResponseData: RegisterResponse = {
      user: { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' },
      access: 'access-token',
      refresh: 'refresh-token',
    };
    mockApiPost.mockResolvedValueOnce({ data: mockApiResponseData });

    const userData: UserRegistrationData = {
      email: 'test@example.com', first_name: 'Test', last_name: 'User', password: 'password123'
    };
    const response = await authAPI.register(userData);

    expect(response.data).toEqual(mockApiResponseData);
    expect(mockApiPost).toHaveBeenCalledWith('/users/register/', userData);
  });

  it('should login a user and store tokens', async () => {
    const mockLoginResponseData: LoginResponse = {
      user: { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' },
      access: 'access-token',
      refresh: 'refresh-token',
    };
    mockApiPost.mockResolvedValueOnce({ data: mockLoginResponseData });

    const loginCredentials = { email: 'test@example.com', password: 'password123' };
    const response = await authAPI.login(loginCredentials.email, loginCredentials.password);

    expect(response.data).toEqual(mockLoginResponseData);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    expect(mockApiPost).toHaveBeenCalledWith('/token/', loginCredentials);
  });

  it('should logout a user and remove tokens', async () => {
    await authAPI.logout();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  it('should get current user', async () => {
    const mockUserData: UserProfile = { id: "1", name: 'Test User', email: 'test@example.com', isActive: true, joinedDate: new Date().toISOString(), userType: {activityPartner:true, companion:false}, verificationLevel: 'basic' };
    mockApiGet.mockResolvedValueOnce({ data: mockUserData });

    const response = await authAPI.getCurrentUser();
    expect(response.data).toEqual(mockUserData);
    expect(mockApiGet).toHaveBeenCalledWith('/users/me/');
  });

  it('should handle token refresh on 401 error', async () => {
    const originalRequestConfig = {
      url: '/some/protected/route',
      headers: {},
      _retry: false
    } as any; // Type as any for _retry property for testing

    const errorResponse = {
      config: originalRequestConfig,
      response: { status: 401 },
      isAxiosError: true,
    };
    const refreshResponseData = { access: 'new-access-token', refresh: 'new-refresh-token' };
    const retryResponseData = { message: 'success on retry' };

    mockApiGet.mockRejectedValueOnce(errorResponse); // Initial call fails
    mockStaticPost.mockResolvedValueOnce({ data: refreshResponseData }); // axios.post for refresh
    mockApiGet.mockResolvedValueOnce({ data: retryResponseData }); // Retried call with apiClient

    // Get the actual error handler from the interceptor setup
    // This assumes the response interceptor error handler is the second argument to the first call to mockResponseInterceptorUse
    const responseErrorHandler = mockResponseInterceptorUse.mock.calls[0]?.[1];
    if (!responseErrorHandler) {
      throw new Error("Response error handler for interceptor not found or not mocked correctly.");
    }

    // We expect the interceptor to handle the error and retry, ultimately resolving.
    // If the interceptor re-throws an error (e.g., refresh fails), this test would need a catch.
    await responseErrorHandler(errorResponse);

    expect(mockStaticPost).toHaveBeenCalledWith(`${API_URL}/token/refresh/`, { refresh: undefined }); // refreshToken from AsyncStorage (mocked to return undefined for getItem by default)
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
    expect(originalRequestConfig.headers['Authorization']).toBe('Bearer new-access-token');
    // This checks if the *original* request was retried by the interceptor using the *apiClient* instance
    expect(mockApiGet).toHaveBeenCalledWith(originalRequestConfig);
  });
});

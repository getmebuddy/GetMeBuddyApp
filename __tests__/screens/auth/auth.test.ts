import { authAPI, UserRegistrationData, UserLoginData, AuthResponse, User } from '../../../src/api/auth'; // Assuming types are exported from auth API module
// import fetchMock from 'jest-fetch-mock';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define mocks for axios instance methods that apiClient will use
const mockApiPost = jest.fn();
const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();

// Mock what axios.create() returns
const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  get: mockApiGet,
  post: mockApiPost,
  patch: mockApiPatch,
  delete: mockApiDelete,
};

// Mock axios itself
const mockCreate = jest.fn(() => mockAxiosInstance); // This is our spy for axios.create

jest.mock('axios', () => ({
  __esModule: true, // Indicate it's an ES module.
  default: {         // The default export of the axios module.
    create: mockCreate, // axios.default.create will be our spy.
    get: jest.fn(),     // Mock top-level axios.default.get if ever used.
    post: jest.fn(),    // Mock top-level axios.default.post if ever used.
    isAxiosError: jest.fn((payload: any): payload is import('axios').AxiosError => !!payload && payload.isAxiosError === true), // Example for isAxiosError
    // Add any other static/top-level methods of 'axios.default' your code might use.
  },
  // If your code also uses named exports from 'axios' like `import { isAxiosError } from 'axios'`, mock them here.
  // For `import axios from 'axios'`, the `default` export above is what's typically used.
  // To be safe, also providing create at the root if some import somehow bypasses default:
  create: mockCreate,
  isAxiosError: jest.fn((payload: any): payload is import('axios').AxiosError => !!payload && payload.isAxiosError === true),
}));

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
    // Reset all mock implementations and call history
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
    mockApiDelete.mockReset();
    mockCreate.mockClear(); // Clear calls to axios.create itself if needed for some tests
    // AsyncStorage mocks are typically handled by jest.setup.ts or auto-mocks
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

    mockApiPost.mockResolvedValueOnce({ data: mockApiResponse }); // authAPI uses apiClient.post which is mockApiPost

    const userData: UserRegistrationData = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      password: 'password123',
      password_confirm: 'password123',
    };

    const responseData = await authAPI.register(userData);

    expect(responseData).toEqual(mockApiResponse);
    expect(mockApiPost).toHaveBeenCalledWith(
      expect.stringContaining('/users/register/'),
      userData,
      expect.any(Object)
    );
  });

  it('should login a user and store tokens', async () => {
    const mockLoginResponse: AuthResponse = {
      user: {
        id: 1,
        email: 'test@example.com',
      },
      refresh: 'refresh-token',
      access: 'access-token',
    };

    mockApiPost.mockResolvedValueOnce({ data: mockLoginResponse }); // authAPI uses apiClient.post which is mockApiPost

    const loginData: UserLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const responseData = await authAPI.login(loginData.email, loginData.password);

    expect(responseData).toEqual(mockLoginResponse);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    expect(mockApiPost).toHaveBeenCalledWith(
      expect.stringContaining('/token/'),
      loginData,
      expect.any(Object)
    );
  });

  it('should logout a user and remove tokens', async () => {
    // authAPI.logout primarily clears AsyncStorage and doesn't make a network request in its current form.
    // If it did, we would mock it:
    // mockedAxios.post.mockResolvedValueOnce({});

    await authAPI.logout();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    // If authAPI.logout made a call:
    // expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/users/logout/'), expect.anything());
  });
});

// src/api/__mocks__/auth.ts

// Mock the functions exported by the actual src/api/auth.ts
export const authAPI = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  verifyPhone: jest.fn(),
  requestPhoneVerification: jest.fn(),
  firebaseAuth: jest.fn(),
};

// If the default export 'apiClient' from src/api/auth.ts is also used directly
// by any component/module under test (not just internally by authAPI functions),
// then it might need to be mocked here too.
// However, the auth.test.ts specifically tests authAPI methods, which use the internal apiClient.
// So, mocking authAPI methods directly should be sufficient for that test.
// If apiClient itself was imported by the test, this mock would be different:
// export default {
//   post: jest.fn(),
//   get: jest.fn(),
//   patch: jest.fn(),
//   interceptors: {
//     request: { use: jest.fn(), eject: jest.fn() },
//     response: { use: jest.fn(), eject: jest.fn() },
//   },
// };

// For now, we are primarily concerned with mocking the `authAPI` object's methods.
// The original `src/api/auth.ts` exports `authAPI` as a named export and `apiClient` as a default export.
// If tests import `apiClient` directly, that default export needs mocking too.
// The `auth.test.ts` imports `authAPI`.
// The error originates from the internal `apiClient` when `src/api/auth.ts` is loaded.
// A manual mock of `src/api/auth.ts` means the actual `apiClient` inside it won't be created.
// We are essentially bypassing its creation by providing direct mocks for `authAPI` methods.

// To be absolutely safe and also mock the default export if it's ever imported by a test:
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(), // Added delete for completeness
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};
export default mockApiClient;

// __mocks__/react-native.js
import * as ReactNative from 'react-native';

// Mock Alert
const Alert = {
  alert: jest.fn()
};

// Extend ReactNative with mocks
Object.defineProperty(ReactNative, 'Alert', {
  get: () => Alert
});

module.exports = ReactNative;
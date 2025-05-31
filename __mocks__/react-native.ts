import React from 'react';

// Get a reference to the actual react-native module
const RN = jest.requireActual('react-native') as any; // Use 'as any' for easier mocking

// --- Mock specific modules and components ---

// StyleSheet
RN.StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => style, // Often used utility
  hairlineWidth: 1,
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  // Add other StyleSheet properties if tests require them
};

// Alert
RN.Alert = {
  alert: jest.fn(),
};

// Platform
RN.Platform = {
  OS: 'ios', // or 'android', 'web', etc.
  Version: '15.0', // Example version
  constants: {
    reactNativeVersion: { major: 0, minor: 78, patch: 0 }, // Example
    // Add other constants if needed by tests
  },
  select: jest.fn((spec: { ios?: any; android?: any; default?: any; web?: any; native?: any; }) => {
    if (RN.Platform.OS === 'ios' && spec.ios) {
      return spec.ios;
    }
    if (RN.Platform.OS === 'android' && spec.android) {
      return spec.android;
    }
    if (spec.native && (RN.Platform.OS === 'ios' || RN.Platform.OS === 'android')) {
        return spec.native;
    }
    return spec.default;
  }),
};

// NativeModules
// Mock specific NativeModules your app uses and that might be called during tests
RN.NativeModules = {
  ...RN.NativeModules, // Keep existing NativeModules (like UIManager) if not problematic
  SettingsManager: { // Example from previous mock
    settings: {
      AppleLocale: 'en-US',
      AppleLanguages: ['en-US'],
    },
     miljoenmilieu: "test"
  },
  PlatformConstants: { // Example from previous mock
    forceTouchAvailable: false,
    reactNativeVersion: { major: 0, minor: 78, patch: 0 },
    uiMode: "light", // or "dark"
  },
  // Add other specific NativeModules as needed by tests, e.g.
  // MyCustomModule: { someMethod: jest.fn() },
};

// --- Mock Functional Components (if needed by tests, otherwise default RN components are used) ---
// These are simple functional components. If tests rely on specific behaviors of these components,
// the mocks might need to be more sophisticated.
RN.View = (props: any) => React.createElement('View', props, props.children);
RN.Text = (props: any) => React.createElement('Text', props, props.children);
RN.TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props, props.children);
RN.FlatList = (props: any) => React.createElement('FlatList', props, props.children);
RN.ActivityIndicator = (props: any) => React.createElement('ActivityIndicator', props, props.children);
RN.TextInput = (props: any) => React.createElement('TextInput', props, props.children);
RN.ScrollView = (props: any) => React.createElement('ScrollView', props, props.children);
RN.Image = (props: any) => React.createElement('Image', props, props.children);
// Add other components that need basic functional mocks

// --- Mock other APIs ---
RN.Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 667, scale: 2, fontScale: 1 })),
  set: jest.fn(), // if you use Dimensions.set
};

RN.PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((layoutSize: number) => layoutSize * 2),
  roundToNearestPixel: jest.fn((layoutSize: number) => Math.round(layoutSize * 2) / 2),
};

RN.AppState = {
  currentState: 'active',
  addEventListener: jest.fn((event, callback) => {
    // Store callback if you need to simulate events
    return { remove: jest.fn() }; // Return a subscription object with a remove method
  }),
  removeEventListener: jest.fn(),
};

RN.Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn((event, callback) => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// AsyncStorage is usually mocked in jest.setup.ts, but if needed here:
// RN.AsyncStorage = { ... }; // (already mocked in jest.setup.ts)

// Export the modified actual ReactNative module
export = RN;

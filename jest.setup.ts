// jest.setup.ts
import 'react-native'; // This should be imported first
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)), // Adjusted to match return type if not void
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)), // Adjusted
  clear: jest.fn(() => Promise.resolve(null)),      // Adjusted
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve(null)),
  multiRemove: jest.fn(() => Promise.resolve(null)),
  multiMerge: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));


// Mock Animated modules - These are often problematic in Jest
// Using virtual mocks can help avoid errors related to native animations.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // Simpler mock

// Mock React Navigation - simplified version
// For more complex tests involving navigation, consider @testing-library/react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      dispatch: jest.fn(),
      addListener: jest.fn(() => jest.fn()), // Returns an unsubscribe function
      removeListener: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getParent: jest.fn(),
      getState: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
      key: 'mockRouteKey',
      name: 'mockRouteName',
    }),
    useFocusEffect: jest.fn(actualNav.useFocusEffect), // Use actual if it doesn't cause issues
    useIsFocused: jest.fn(() => true),
    NavigationContainer: jest.fn(({ children }: { children: React.ReactNode }) => children), // Basic pass-through
    // createNavigatorFactory: actualNav.createNavigatorFactory, // If needed
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children, // Simplified, might need to be null or specific mock
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children, // Simplified
  }),
}));
// Midpoint for splitting the content
// Mock react-native-gesture-handler
// This is a common simplified mock. For specific gesture tests, this might be insufficient.
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    // ToolbarAndroid: View, // Deprecated
    // ViewPagerAndroid: View, // Deprecated
    DrawerLayoutAndroid: View,
    // WebView: View, // Deprecated, use react-native-webview
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((Component) => Component),
    Directions: {},
  };
});

// Mock react-native Reanimated v2
// For Reanimated v1, the mock might be different or not needed if NativeAnimatedHelper is mocked.
// For Reanimated v2/v3, a more complex setup is often needed if you test animations.
// This is a very basic mock to prevent crashes.
global.ReanimatedDataMock = { // Using global to mimic the original JS, though direct export/import is cleaner in TS
  now: () => 0,
};
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'), // Use the official mock
  useSharedValue: jest.fn(initial => ({ value: initial })),
  useAnimatedStyle: jest.fn(style => style),
  withTiming: jest.fn(value => value),
  withSpring: jest.fn(value => value),
  withRepeat: jest.fn(value => value),
  withSequence: jest.fn(value => value),
  Easing: {
    linear: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  // Add other Reanimated exports you use that need mocking
}));


// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }: { children: React.ReactNode }) => children),
    SafeAreaConsumer: jest.fn(({ children }: { children: (insets: typeof inset) => React.ReactNode }) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })), // Example frame
  };
});


// Mock react-native's Alert module
// This was in the original, but jest.requireActual('react-native') might handle it.
// If specific Alert behavior needs to be asserted, this explicit mock is better.
// The provided initial code had a global 'react-native' mock for Alert, so keeping that pattern:
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Optional: Silence console.error and console.warn during tests if they are too noisy
// (global as any).console = {
//   ...console,
//   // log: jest.fn(),
//   // warn: jest.fn(),
//   // error: jest.fn(),
// };
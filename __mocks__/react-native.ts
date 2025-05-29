import * as ReactNative from 'react-native';
import React from 'react';

// Mock specific components
const View = (props: any) => React.createElement('View', props, props.children);
const Text = (props: any) => React.createElement('Text', props, props.children);
const TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props, props.children);
const StyleSheet = {
  create: (styles: any) => styles,
};
const Alert = {
  alert: jest.fn(),
};

// Mock other commonly used modules/components as needed
const Platform = {
  OS: 'ios',
  Version: '15.0',
  select: jest.fn((spec) => spec.ios || spec.default),
};

const NativeModules = {
  // Mock any specific native modules your app uses
  SettingsManager: {
    settings: {
      AppleLocale: 'en-US',
    },
  },
  PlatformConstants: {
    forceTouchAvailable: false,
  },
};

// Override React Native's exports with our mocks
const mockReactNative = {
  ...ReactNative, // Spread original react-native exports
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  NativeModules,
  // Add other mocks here as needed
  // For example, if you use FlatList, ActivityIndicator, etc.
  FlatList: (props: any) => React.createElement('FlatList', props, props.children),
  ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props, props.children),
  TextInput: (props: any) => React.createElement('TextInput', props, props.children),
  ScrollView: (props: any) => React.createElement('ScrollView', props, props.children),
  Image: (props: any) => React.createElement('Image', props, props.children),
  // Mock for Dimensions
  Dimensions: {
    get: jest.fn(() => ({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 1,
    })),
  },
  // Mock for PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((layoutSize) => layoutSize * 2),
    roundToNearestPixel: jest.fn((layoutSize) => Math.round(layoutSize * 2) / 2),
  },
   // Mock for AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  // Mock for Linking
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  // Mock for AsyncStorage
  AsyncStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    mergeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    multiMerge: jest.fn(() => Promise.resolve()),
  },
};

export = mockReactNative;

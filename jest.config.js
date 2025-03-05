module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native-.*|@react-navigation/.*|@react-native-community|redux-mock-store|react-redux)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/imageMock.js',
    // Add these mappings to fix the path issues:
    '^../../../api/(.*)$': '<rootDir>/src/api/$1',
    '^../../../../src/store/reducers/(.*)$': '<rootDir>/src/store/reducers/$1',
    '^../../../screens/(.*)$': '<rootDir>/src/screens/$1'
  }
};
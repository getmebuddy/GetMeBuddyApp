module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.ts'], // Updated to .ts
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native-.*|@react-navigation/.*|@react-native-community|redux-mock-store|react-redux|redux-thunk)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // Assuming mocks were converted to .ts as per previous subtasks
    '\\.svg': '<rootDir>/__mocks__/svgMock.ts',
    '\\.(jpg|jpeg|png|gif)$': '<rootDir>/__mocks__/imageMock.ts',
    // Verify these custom path mappings are still accurate and needed
    // For example, if using tsconfig.json paths, these might be redundant or conflict.
    // For now, keeping them as they were, assuming they serve a purpose.
    '^../../../api/(.*)$': '<rootDir>/src/api/$1',
    '^../../../../src/store/reducers/(.*)$': '<rootDir>/src/store/reducers/$1',
    '^../../../screens/(.*)$': '<rootDir>/src/screens/$1'
  }
};
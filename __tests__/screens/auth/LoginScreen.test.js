import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // Note: changed from configureMockStore
import thunkMiddleware from 'redux-thunk'; // More explicit import

// Correct way to set up the mock store with thunk middleware
const mockStore = configureStore([thunkMiddleware]);

describe('LoginScreen', () => {
  let store;
  
  beforeEach(() => {
    // Create a fresh store for each test
    store = mockStore({
      auth: {
        loading: false,
        error: null,
      }
    });
    
    // Mock the login action dispatch
    store.dispatch = jest.fn().mockResolvedValue({});
  });
  
  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );
    
    // Check if the login elements are rendered
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });
  
  // Rest of test remains the same...
});
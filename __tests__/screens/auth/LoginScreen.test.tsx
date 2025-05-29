import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import LoginScreen from '../../../src/screens/auth/LoginScreen'; // Assuming this is the correct path
import { RootState } from '../../../src/store/reducers'; // Assuming a RootState type is defined
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

// Define the type for the mock store
type MockStore = ReturnType<typeof mockStore>;

const middlewares = [thunkMiddleware];
const mockStore = configureStore<Partial<RootState>, ThunkDispatch<RootState, undefined, AnyAction>>(middlewares);

describe('LoginScreen', () => {
  let store: MockStore;

  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        user: null, // Assuming user can be null
        token: null, // Assuming token can be null
      }
    });

    // Mock the store's dispatch function
    // store.dispatch = jest.fn().mockResolvedValue({}); // Already a ThunkDispatch
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('dispatches login action on button press', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    // Check if store.dispatch was called.
    // The specifics of what it's called with depend on the loginUser action creator.
    // For now, just check that it was called.
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
      // You might want to add more specific checks here, e.g.,
      // expect(store.dispatch).toHaveBeenCalledWith(loginUser('test@example.com', 'password123'));
      // This requires loginUser action to be imported and potentially mocked if it's complex.
    });
  });

  it('shows error message on login failure', async () => {
    // Reconfigure store for this specific test case to simulate an error
    store = mockStore({
      auth: {
        loading: false,
        error: 'Invalid credentials', // Simulate an error message
        user: null,
        token: null,
      }
    });
    // store.dispatch = jest.fn().mockResolvedValue({}); // Dispatch will be handled by thunk

    const { getByPlaceholderText, getByText, findByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));
    
    // This assumes LoginScreen displays the error from the store
    const errorMessage = await findByText('Invalid credentials');
    expect(errorMessage).toBeTruthy();
  });
});

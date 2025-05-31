import { createStore, applyMiddleware, combineReducers, Action, AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk'; // Revert to standard ES6 import
import type { ThunkAction, ThunkDispatch } from 'redux-thunk'; // Import types separately
// Import logger if you use it, e.g., import logger from 'redux-logger';

// Import all typed reducers
import authReducer from './reducers/authReducer';
import companionshipReducer from './reducers/companionshipReducer';
import matchReducer from './reducers/matchReducer';
import messageReducer from './reducers/messageReducer';
import profileReducer from './reducers/profileReducer';
import safetyReducer from './reducers/safetyReducer';
import verificationReducer from './reducers/verificationReducer';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  matches: matchReducer,
  messages: messageReducer,
  verification: verificationReducer,
  companionship: companionshipReducer,
  safety: safetyReducer,
  // Add other reducers here as they are created/converted
  // engagement: engagementReducer, // Example if you had one
  // monetization: monetizationReducer, // Example
});

// Define RootState type from the rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Define AppDispatch type for thunk dispatch capabilities
// This explicitly types dispatch to understand thunks.
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Define a generic AppThunk type for thunk action creators
// ReturnType: The type of the value that the thunk promises to return (e.g., void, Promise<number>, etc.)
// StateType: Typically RootState.
// ExtraThunkArgType: The type of the `extraArgument` passed to thunks (if any, typically `unknown` or a specific services object).
// BasicActionType: The base type of actions that can be dispatched (typically `Action<string>` or `AnyAction`).
export type AppThunk<ReturnType = void, BasicActionType extends Action = AnyAction> = ThunkAction<
  ReturnType,
  RootState,
  unknown, // No extra argument used with thunk middleware in this setup
  BasicActionType
>;


// Middlewares array
// Add other middlewares like redux-logger here if needed
const middlewares: Middleware[] = [thunk as Middleware]; // Use thunk directly, with cast

// Create store
const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
  // You can also add Redux DevTools enhancer here:
  // composeWithDevTools(applyMiddleware(...middlewares))
);

export default store;

// Note: If using Redux Persist or other store enhancers, the setup would be more complex.
// This setup provides a basic typed Redux store with Thunk middleware.
// Ensure all imported reducers (authReducer, profileReducer, etc.) are fully typed
// with their respective state interfaces and action type unions.

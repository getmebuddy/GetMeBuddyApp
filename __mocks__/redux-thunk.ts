// __mocks__/redux-thunk.ts
import { Middleware, Dispatch, AnyAction } from 'redux'; // Import Redux types for clarity

// Define a generic state type, or use RootState if circular dependencies aren't an issue here
type State = any;

const thunk: Middleware<{}, State, Dispatch<AnyAction>> =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (typeof action === 'function') {
      // Pass any extra arguments the thunk might expect (though our setup has none)
      return action(dispatch, getState, undefined);
    }
    return next(action);
  };

export default thunk;

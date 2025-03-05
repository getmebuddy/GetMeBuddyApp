import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './reducers/authReducer';
import profileReducer from './reducers/profileReducer';
import matchReducer from './reducers/matchReducer';
import messageReducer from './reducers/messageReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  matches: matchReducer,
  messages: messageReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
// src/store/index.js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './reducers/authReducer';
import profileReducer from './reducers/profileReducer';
import matchReducer from './reducers/matchReducer';
import messageReducer from './reducers/messageReducer';
import verificationReducer from './reducers/verificationReducer';
import companionshipReducer from './reducers/companionshipReducer';
import safetyReducer from './reducers/safetyReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  matches: matchReducer,
  messages: messageReducer,
  verification: verificationReducer,
  companionship: companionshipReducer,
  safety: safetyReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
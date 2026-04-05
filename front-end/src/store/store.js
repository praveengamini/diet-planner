import { configureStore, combineReducers } from '@reduxjs/toolkit';
import otpReducer from './otp/index.js'
import authReducer from './auth/index.js'; 
import dietReducer from "./diet";
const rootReducer = combineReducers({
 
  auth: authReducer,
  otp: otpReducer,
  diet: dietReducer
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import dataReducer from './slices/data.slice';
import uiReducer from './slices/ui.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  data: dataReducer,
  ui: uiReducer,
});

export default rootReducer;
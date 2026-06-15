import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import employeeReducer from './slices/employeeSlice.js';
import leaveReducer from './slices/leaveSlice.js';
import assetReducer from './slices/assetSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    leave: leaveReducer,
    asset: assetReducer,
  },
});

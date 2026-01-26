import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';
import bookingsReducer from './slices/bookingsSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    bookings: bookingsReducer,
    maintenance: maintenanceReducer,
    chat: chatReducer,
  },
});

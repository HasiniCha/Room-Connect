import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async () => {
    const response = await api.get('/api/bookings/my-bookings'); 
    return response.data;
  }
);

export const fetchLandlordBookings = createAsyncThunk(
  'bookings/fetchLandlord',
  async () => {
    const response = await api.get('/api/bookings/landlord/bookings');
    return response.data;
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ bookingId, status }) => {
    const response = await api.patch(`/api/bookings/${bookingId}/status`, { status });
    return response.data;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLandlordBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandlordBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchLandlordBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default bookingsSlice.reducer;
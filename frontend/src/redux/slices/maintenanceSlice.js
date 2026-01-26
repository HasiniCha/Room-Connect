import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchMaintenanceRequests = createAsyncThunk(
  'maintenance/fetch',
  async () => {
    const response = await api.get('/api/maintenance');
    return response.data;
  }
);

export const createMaintenanceRequest = createAsyncThunk(
  'maintenance/create',
  async (requestData) => {
    const response = await api.post('/api/maintenance', requestData);
    return response.data;
  }
);

export const updateRequestStatus = createAsyncThunk(
  'maintenance/updateStatus',
  async ({ requestId, status }) => {
    const response = await api.patch(`/api/maintenance/${requestId}`, { status });
    return response.data;
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(createMaintenanceRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      });
  },
});

export default maintenanceSlice.reducer;
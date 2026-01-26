import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProperties = createAsyncThunk(
  'properties/fetch',
  async (filters = {}) => {
    const response = await api.get('/api/properties', { params: filters });
    return response.data;
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (propertyData) => {
    const response = await api.post('/api/properties', propertyData);
    return response.data;
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    list: [],
    currentProperty: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentProperty: (state, action) => {
      state.currentProperty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export const { setCurrentProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
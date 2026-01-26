import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: {},
    activeRoom: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    clearMessages: (state, action) => {
      const roomId = action.payload;
      state.messages[roomId] = [];
    },
  },
});

export const { addMessage, setActiveRoom, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
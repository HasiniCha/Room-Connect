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
      // Prevent duplicate messages by _id
      const exists = message._id &&
        state.messages[roomId].some((m) => m._id === message._id);
      if (!exists) {
        state.messages[roomId].push(message);
      }
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

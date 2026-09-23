import { createSlice } from "@reduxjs/toolkit";
import { MOCK_MESSAGES } from "@/lib/mock/messages";

const initialState = {
  items: MOCK_MESSAGES,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    markAllMessagesRead(state) {
      state.items.forEach((item) => {
        item.read = true;
      });
    },
    markOneMessageRead(state, action) {
      const item = state.items.find((m) => m.id === action.payload);
      if (item) item.read = true;
    },
  },
});

export const { markAllMessagesRead, markOneMessageRead } = messagesSlice.actions;

export default messagesSlice.reducer;

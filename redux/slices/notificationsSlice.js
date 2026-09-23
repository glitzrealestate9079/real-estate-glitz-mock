import { createSlice } from "@reduxjs/toolkit";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/notifications";

const initialState = {
  items: MOCK_NOTIFICATIONS,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markAllRead(state) {
      state.items.forEach((item) => {
        item.read = true;
      });
    },
    markOneRead(state, action) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    addNotification(state, action) {
      state.items.unshift({ read: false, time: "Just now", ...action.payload });
    },
  },
});

export const { markAllRead, markOneRead, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;

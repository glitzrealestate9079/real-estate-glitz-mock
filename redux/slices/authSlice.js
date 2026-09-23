import { createSlice } from "@reduxjs/toolkit";

// Frontend-only mock auth — mirrors the settings module's admin-user records so the identity
// shown here (topbar avatar, My Profile page) stays consistent with Settings > Admin Users.
// Session is persisted to localStorage by AuthEffect, the same pattern ThemeEffect uses for
// dark mode / color theme, so a refresh doesn't silently log the admin out.
export const DEMO_ACCOUNTS = [
  { email: "krishna.singh@example.com", password: "admin123", name: "Krishna Singh", role: "Super Admin" },
  { email: "anjali.verma@example.com", password: "admin123", name: "Anjali Verma", role: "Moderator" },
];

const initialState = {
  isAuthenticated: false,
  hydrated: false, // becomes true once AuthEffect has checked localStorage, so the guard doesn't flash a redirect before that check runs
  user: null, // { name, email, role }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    updateProfile(state, action) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
    setHydrated(state, action) {
      state.hydrated = action.payload;
    },
  },
});

export const { login, logout, updateProfile, setHydrated } = authSlice.actions;

export default authSlice.reducer;

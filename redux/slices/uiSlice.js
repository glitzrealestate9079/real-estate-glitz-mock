import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_THEME_ID } from "@/lib/themes";

const initialState = {
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  darkMode: false,
  colorTheme: DEFAULT_THEME_ID,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    openMobileDrawer(state) {
      state.mobileDrawerOpen = true;
    },
    closeMobileDrawer(state) {
      state.mobileDrawerOpen = false;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
    },
    setColorTheme(state, action) {
      state.colorTheme = action.payload;
    },
  },
});

export const {
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openMobileDrawer,
  closeMobileDrawer,
  toggleDarkMode,
  setDarkMode,
  setColorTheme,
} = uiSlice.actions;

export default uiSlice.reducer;

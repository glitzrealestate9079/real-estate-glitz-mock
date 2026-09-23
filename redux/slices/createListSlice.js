import { createSlice } from "@reduxjs/toolkit";

/**
 * Factory for the "table-backed module" slices (listings, users, leads, payments,
 * builders, reviews, cms, settings, township). Each module page will list/filter/
 * select rows, so they all share this shape instead of re-writing the same reducers.
 *
 * Also carries the generic add/update/remove/status reducers every module's CRUD forms
 * need — items just need a stable `id` field. All mutation happens against the local Redux
 * store (this is a frontend-only scaffold with mock data, per the project README).
 *
 * Usage:
 *   const listingsSlice = createListSlice("listings");
 *   export const { setItems: setListings, addItem: addListing, ... } = listingsSlice.actions;
 *   export default listingsSlice.reducer;
 */
export function createListSlice(name, extraInitialState = {}) {
  const initialState = {
    items: [],
    filters: {},
    selectedId: null,
    loading: false,
    error: null,
    ...extraInitialState,
  };

  return createSlice({
    name,
    initialState,
    reducers: {
      setItems(state, action) {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      },
      setFilters(state, action) {
        state.filters = { ...state.filters, ...action.payload };
      },
      resetFilters(state) {
        state.filters = {};
      },
      setSelectedId(state, action) {
        state.selectedId = action.payload;
      },
      setLoading(state, action) {
        state.loading = action.payload;
      },
      setError(state, action) {
        state.loading = false;
        state.error = action.payload;
      },
      /** Adds a new row at the top of the list. */
      addItem(state, action) {
        state.items.unshift(action.payload);
      },
      /** Merges a partial update into the row matching `payload.id`. */
      updateItem(state, action) {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = { ...state.items[index], ...action.payload };
      },
      /** Removes a single row by id. */
      removeItem(state, action) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      },
      /** Removes every row whose id is in the given array (bulk delete). */
      removeItems(state, action) {
        const ids = new Set(action.payload);
        state.items = state.items.filter((item) => !ids.has(item.id));
      },
      /** Sets `status` (plus any extra fields, e.g. a rejection reason) on one row. */
      updateItemStatus(state, action) {
        const { id, ...rest } = action.payload;
        const index = state.items.findIndex((item) => item.id === id);
        if (index !== -1) state.items[index] = { ...state.items[index], ...rest };
      },
      /** Sets the same status (plus any extra fields) on every row in the given id array. */
      updateItemsStatus(state, action) {
        const { ids, ...rest } = action.payload;
        const idSet = new Set(ids);
        state.items = state.items.map((item) => (idSet.has(item.id) ? { ...item, ...rest } : item));
      },
    },
  });
}

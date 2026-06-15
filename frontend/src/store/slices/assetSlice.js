import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assets: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    assetStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAssetsSuccess: (state, action) => {
      state.loading = false;
      state.assets = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
    },
    assetActionSuccess: (state) => {
      state.loading = false;
    },
    assetFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  assetStart,
  fetchAssetsSuccess,
  assetActionSuccess,
  assetFailure,
} = assetSlice.actions;

export default assetSlice.reducer;

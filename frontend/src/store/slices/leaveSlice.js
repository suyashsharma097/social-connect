import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leaves: [],
  total: 0,
  page: 1,
  totalPages: 1,
  balances: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    leaveStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLeavesSuccess: (state, action) => {
      state.loading = false;
      state.leaves = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
    },
    fetchBalancesSuccess: (state, action) => {
      state.loading = false;
      state.balances = action.payload;
    },
    leaveActionSuccess: (state) => {
      state.loading = false;
    },
    leaveFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  leaveStart,
  fetchLeavesSuccess,
  fetchBalancesSuccess,
  leaveActionSuccess,
  leaveFailure,
} = leaveSlice.actions;

export default leaveSlice.reducer;

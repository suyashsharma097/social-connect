import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [],
  total: 0,
  page: 1,
  totalPages: 1,
  limit: 10,
  departments: [],
  skills: [],
  currentEmployee: null,
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess: (state, action) => {
      state.loading = false;
      state.employees = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.limit = action.payload.limit;
    },
    fetchEmployeeByIdSuccess: (state, action) => {
      state.loading = false;
      state.currentEmployee = action.payload;
    },
    fetchMastersSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.departments) {
        state.departments = action.payload.departments;
      }
      if (action.payload.skills) {
        state.skills = action.payload.skills;
      }
    },
    actionSuccess: (state) => {
      state.loading = false;
    },
    actionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
  },
});

export const {
  fetchStart,
  fetchEmployeesSuccess,
  fetchEmployeeByIdSuccess,
  fetchMastersSuccess,
  actionSuccess,
  actionFailure,
  clearCurrentEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;

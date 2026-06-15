import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './router/router.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmployeeList from './pages/EmployeeList.jsx';
import EmployeeForm from './pages/EmployeeForm.jsx';
import LeaveList from './pages/LeaveList.jsx';
import AssetList from './pages/AssetList.jsx';

const App = () => {
  return (
    <Routes>
      {/* Public Routes (only accessible when logged out) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Protected Routes (only accessible when logged in) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaves" element={<LeaveList />} />
          
          {/* Management Only (Admin, HR, Manager) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']} />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/assets" element={<AssetList />} />
          </Route>

          {/* Admin & HR Only (Can create/edit profiles) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']} />}>
            <Route path="/employees/create" element={<EmployeeForm />} />
            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;

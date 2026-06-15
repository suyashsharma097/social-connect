import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../store/slices/authSlice.js';
import api from '../services/api.js';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Monitor, 
  FolderTree, 
  LogOut, 
  User,
  ShieldAlert
} from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const isManagement = ['ADMIN', 'HR', 'MANAGER'].includes(user?.role);
  const isAdminOrHR = ['ADMIN', 'HR'].includes(user?.role);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <FolderTree className="gradient-text" size={24} style={{ stroke: 'url(#brand-grad)' }} />
          <span>Social <span className="gradient-text" style={{ fontWeight: 800 }}>Connect</span></span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `sidebar-item-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {isManagement && (
              <li>
                <NavLink 
                  to="/employees" 
                  className={({ isActive }) => `sidebar-item-link ${isActive ? 'active' : ''}`}
                >
                  <Users size={18} />
                  <span>Employees</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink 
                to="/leaves" 
                className={({ isActive }) => `sidebar-item-link ${isActive ? 'active' : ''}`}
              >
                <CalendarDays size={18} />
                <span>Leaves</span>
              </NavLink>
            </li>

            {isManagement && (
              <li>
                <NavLink 
                  to="/assets" 
                  className={({ isActive }) => `sidebar-item-link ${isActive ? 'active' : ''}`}
                >
                  <Monitor size={18} />
                  <span>Assets</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              color: 'white'
            }}>
              {user?.email[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
              <span className="badge badge-pending" style={{ fontSize: '10px', padding: '2px 6px', marginTop: '2px' }}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-full" style={{ padding: '8px 12px', fontSize: '13px' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SVG Gradient definition for Lucide Icon */}
      <svg width="0" height="0">
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </svg>

      {/* Main Content Area */}
      <main className="main-content">
        {!user?.isVerified && (
          <div className="glass-panel" style={{
            padding: '12px 20px',
            marginBottom: '24px',
            borderLeft: '4px solid var(--warning)',
            background: 'rgba(245, 158, 11, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldAlert style={{ color: 'var(--warning)' }} size={20} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>Notice:</strong> Your email address is not verified yet. Please check your inbox for the verification link.
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import { 
  Users, 
  Calendar, 
  Monitor, 
  FileText, 
  Award,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  const role = user?.role;
  const isManagement = ['ADMIN', 'HR', 'MANAGER'].includes(role);
  const system = stats?.system;
  const personal = stats?.personal || stats; // Personal statistics fallback

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Welcome back, <span className="gradient-text">{user?.email.split('@')[0]}</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your overview for today</p>
        </div>
        <div className="badge badge-pending" style={{ padding: '6px 16px', fontSize: '14px' }}>
          Portal Mode: {role}
        </div>
      </div>

      {isManagement && system && (
        <>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Overview</h2>
          <div className="grid-stats">
            {/* Active Employees */}
            <div className="glass-panel stat-card">
              <div>
                <span className="stat-label">Active Team Members</span>
                <h3 className="stat-value">{system.employees.totalActive}</h3>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
                <Users size={24} />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="glass-panel stat-card">
              <div>
                <span className="stat-label">Pending Leaves</span>
                <h3 className="stat-value">{system.leaves.pending}</h3>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                <Calendar size={24} />
              </div>
            </div>

            {/* Total Assets */}
            <div className="glass-panel stat-card">
              <div>
                <span className="stat-label">Allocated Assets</span>
                <h3 className="stat-value">{system.assets.assigned} / {system.assets.total}</h3>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                <Monitor size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
            {/* Department Breakdown */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} className="gradient-text" />
                <span>Department Headcount</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {system.employees.byDepartment.map((dept, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                      <span>{dept.name}</span>
                      <span style={{ fontWeight: 600 }}>{dept.count} {dept.count === 1 ? 'employee' : 'employees'}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${system.employees.totalActive > 0 ? (dept.count / system.employees.totalActive) * 100 : 0}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                ))}
                {system.employees.byDepartment.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No department statistics available.</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['ADMIN', 'HR'].includes(role) && (
                  <>
                    <Link to="/employees" className="btn btn-primary btn-full">Add New Employee</Link>
                    <Link to="/assets" className="btn btn-secondary btn-full">Register Hardware Asset</Link>
                  </>
                )}
                <Link to="/leaves" className="btn btn-secondary btn-full">Review Leave Workspace</Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Personal Section for Employees / personal stats */}
      {personal && (
        <>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: isManagement ? '20px' : '0' }}>
            Personal Workspace
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Leave Balances */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} className="gradient-text" />
                <span>Available Leave Balances</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                {personal.balances && personal.balances.filter(b => b.type !== 'UNPAID').map((bal, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{bal.type}</p>
                    <h4 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', color: 'white' }}>{bal.balance}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days Remaining</span>
                  </div>
                ))}
                {(!personal.balances || personal.balances.filter(b => b.type !== 'UNPAID').length === 0) && (
                  <p style={{ gridColumn: 'span 3', color: 'var(--text-muted)', fontSize: '14px' }}>No leave balances allocated yet.</p>
                )}
              </div>
              <Link to="/leaves" className="btn btn-primary btn-full" style={{ marginTop: '20px' }}>Apply For Leave</Link>
            </div>

            {/* Assigned Assets */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Monitor size={20} className="gradient-text" />
                <span>Assigned Workspace Assets</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {personal.assets && personal.assets.map((asset, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{asset.name}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>S/N: {asset.serialNumber}</span>
                    </div>
                    <span className="badge badge-active">{asset.type}</span>
                  </div>
                ))}
                {(!personal.assets || personal.assets.length === 0) && (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FolderOpen size={36} />
                    <p style={{ fontSize: '14px' }}>No hardware assets currently allocated to you.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

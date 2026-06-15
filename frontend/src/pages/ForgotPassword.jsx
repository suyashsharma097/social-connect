import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('If the email exists, a password reset link has been dispatched.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h1 className="auth-logo">
          Social <span className="gradient-text" style={{ fontWeight: 800 }}>Connect</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Reset your credentials
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            borderLeft: '3px solid var(--danger)'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'left',
            borderLeft: '3px solid var(--success)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. employee@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }} disabled={loading}>
            <Mail size={18} />
            <span>{loading ? 'Dispatching Reset Link...' : 'Send Reset Link'}</span>
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

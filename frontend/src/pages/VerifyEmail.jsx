import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../services/api.js';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const doVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed or link has expired.');
      }
    };

    doVerification();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h1 className="auth-logo">
          Social <span className="gradient-text" style={{ fontWeight: 800 }}>Connect</span>
        </h1>

        <div style={{ margin: '32px 0' }}>
          {status === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 className="gradient-text" style={{ animation: 'spin 1s linear infinite' }} size={48} />
              <p style={{ color: 'var(--text-secondary)' }}>Verifying your email address, please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <ShieldCheck style={{ color: 'var(--success)' }} size={56} />
              <h2 style={{ color: 'var(--success)' }}>Account Verified!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <ShieldAlert style={{ color: 'var(--danger)' }} size={56} />
              <h2 style={{ color: 'var(--danger)' }}>Verification Failed</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            </div>
          )}
        </div>

        <Link to="/login" className="btn btn-primary btn-full">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;

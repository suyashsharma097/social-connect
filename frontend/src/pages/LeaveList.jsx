import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { leaveStart, fetchLeavesSuccess, fetchBalancesSuccess, leaveFailure, leaveActionSuccess } from '../store/slices/leaveSlice.js';
import api from '../services/api.js';
import { Calendar, Plus, CheckCircle, XCircle, Clock, FolderOpen } from 'lucide-react';

const LeaveList = () => {
  const { leaves, total, page, totalPages, balances, loading } = useSelector((state) => state.leave);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Review states
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('SICK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // Comment state for reviewing leaves
  const [reviewerComments, setReviewerComments] = useState({}); // { leaveId: comment }

  const fetchLeaves = async () => {
    dispatch(leaveStart());
    try {
      const res = await api.get('/leaves', {
        params: {
          page: currentPage,
          limit: 6,
          status: statusFilter,
        },
      });
      dispatch(fetchLeavesSuccess(res.data.data));
    } catch (err) {
      dispatch(leaveFailure(err.response?.data?.message || 'Failed to fetch leave logs.'));
    }
  };

  const fetchBalances = async () => {
    if (!user.employee) return;
    try {
      const res = await api.get('/leaves/balances');
      dispatch(fetchBalancesSuccess(res.data.data.balances));
    } catch (err) {
      console.error('Failed to fetch leave balances:', err.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchBalances();
  }, [currentPage, statusFilter]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (!startDate || !endDate || !reason) {
      setApplyError('All fields are required.');
      return;
    }

    try {
      await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      setApplySuccess('Leave request submitted successfully.');
      setStartDate('');
      setEndDate('');
      setReason('');
      
      // Refresh
      fetchLeaves();
      fetchBalances();

      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess('');
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  const handleReviewLeave = async (id, status) => {
    const comment = reviewerComments[id] || '';
    try {
      await api.post(`/leaves/${id}/review`, {
        status,
        comment,
      });
      alert(`Leave request has been ${status.toLowerCase()} successfully.`);
      fetchLeaves();
      fetchBalances();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave request status.');
    }
  };

  const handleCommentChange = (id, val) => {
    setReviewerComments({
      ...reviewerComments,
      [id]: val,
    });
  };

  const isManagement = ['ADMIN', 'HR', 'MANAGER'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Apply for time off and manage workflows</p>
        </div>
        {user.employee && (
          <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* Leave Balances Grid (If Employee) */}
      {user.employee && balances.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Leave Balance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {balances.map((bal, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{bal.leaveType}</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginTop: '4px' }}>{bal.balance}</h3>
                </div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Calendar size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px' }}>Leave Logs</h3>
        <div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '180px', padding: '8px 12px', fontSize: '14px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_MANAGER">Pending Manager</option>
            <option value="PENDING_HR">Pending HR</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Records list */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Loading leave requests...</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Details</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    {isManagement && <th style={{ width: '300px' }}>Review Panel</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                    // Check if reviewer can act on this leave:
                    // Managers can act if status is PENDING_MANAGER
                    // HR/Admin can act if status is PENDING_HR (or PENDING_MANAGER as override)
                    const canAct = (user.role === 'MANAGER' && leave.status === 'PENDING_MANAGER') ||
                                   (['HR', 'ADMIN'].includes(user.role) && ['PENDING_HR', 'PENDING_MANAGER'].includes(leave.status));

                    let badgeClass = 'badge-pending';
                    if (leave.status === 'APPROVED') badgeClass = 'badge-approved';
                    if (leave.status === 'REJECTED') badgeClass = 'badge-rejected';

                    return (
                      <tr key={leave.id}>
                        <td>
                          <p style={{ fontWeight: 600 }}>{leave.employee?.firstName} {leave.employee?.lastName}</p>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{leave.employee?.email}</span>
                        </td>
                        <td>
                          <p style={{ fontWeight: 500 }}>{leave.leaveType}</p>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
                        </td>
                        <td>
                          <p style={{ fontSize: '14px' }}>{start.toDateString()}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to {end.toDateString()}</p>
                        </td>
                        <td style={{ maxWidth: '200px', wordBreak: 'break-word', fontSize: '14px' }}>{leave.reason}</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{leave.status.replace('_', ' ')}</span>
                          {(leave.managerComment || leave.hrComment) && (
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                              Comment: {leave.managerComment || leave.hrComment}
                            </p>
                          )}
                        </td>
                        {isManagement && (
                          <td>
                            {canAct ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Review comments..."
                                  value={reviewerComments[leave.id] || ''}
                                  onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleReviewLeave(leave.id, 'APPROVED')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}>
                                    <CheckCircle size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button onClick={() => handleReviewLeave(leave.id, 'REJECTED')} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}>
                                    <XCircle size={14} />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reviewed / Over role scope</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan={isManagement ? 6 : 5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No leave logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Page {page} of {totalPages} (Total: {total} requests)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>New Leave Application</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            {applyError && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.12)',
                color: 'var(--danger)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px',
                borderLeft: '3px solid var(--danger)'
              }}>
                {applyError}
              </div>
            )}

            {applySuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px',
                borderLeft: '3px solid var(--success)'
              }}>
                {applySuccess}
              </div>
            )}

            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="UNPAID">Unpaid / LWP</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Explanation</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are applying for time off..."
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;

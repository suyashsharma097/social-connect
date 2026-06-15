import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStart, fetchEmployeesSuccess, fetchMastersSuccess, actionFailure } from '../store/slices/employeeSlice.js';
import api from '../services/api.js';
import { Search, UserPlus, FileEdit, Trash2, ShieldAlert } from 'lucide-react';

const EmployeeList = () => {
  const { employees, total, page, totalPages, departments, loading } = useSelector((state) => state.employee);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedMsg, setDeletedMsg] = useState('');

  const fetchEmployees = async () => {
    dispatch(fetchStart());
    try {
      const res = await api.get('/employees', {
        params: {
          page: currentPage,
          limit: 8,
          search,
          departmentId,
        },
      });
      dispatch(fetchEmployeesSuccess(res.data.data));
    } catch (err) {
      dispatch(actionFailure(err.response?.data?.message || 'Failed to fetch employees.'));
    }
  };

  const fetchMasters = async () => {
    try {
      const res = await api.get('/masters/departments');
      dispatch(fetchMastersSuccess({ departments: res.data.data.departments }));
    } catch (err) {
      console.error('Failed to fetch departments:', err.message);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, departmentId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will also delete the login credentials.')) return;
    try {
      await api.delete(`/employees/${id}`);
      setDeletedMsg('Employee deleted successfully.');
      fetchEmployees();
      setTimeout(() => setDeletedMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const isAdminOrHR = ['ADMIN', 'HR'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px' }}>Employee Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View and manage corporate team profiles</p>
        </div>
        {isAdminOrHR && (
          <Link to="/employees/create" className="btn btn-primary">
            <UserPlus size={18} />
            <span>Add Employee</span>
          </Link>
        )}
      </div>

      {deletedMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--success)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          marginBottom: '20px',
          borderLeft: '3px solid var(--success)'
        }}>
          {deletedMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
          </div>

          {/* Department */}
          <div style={{ width: '220px' }}>
            <select
              className="form-control"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
      </div>

      {/* Employees Grid/Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Loading team registry...</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Email / Phone</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Skills Profile</th>
                    {isAdminOrHR && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--bg-tertiary)',
                            backgroundImage: emp.profileImage ? `url(https://social-connect-production-80fd.up.railway.app${emp.profileImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            fontWeight: 'bold',
                            color: 'var(--text-secondary)'
                          }}>
                            {!emp.profileImage && emp.firstName[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</p>
                            <span className="badge badge-active" style={{ fontSize: '10px', padding: '2px 6px', marginTop: '2px' }}>{emp.status}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontSize: '14px' }}>{emp.email}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.phone || 'No phone'}</p>
                      </td>
                      <td>{emp.department?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td>${parseFloat(emp.salary).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {emp.skills && emp.skills.map((s, idx) => (
                            <span key={idx} className="badge badge-pending" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {s.skill?.name} ({s.proficiencyLevel})
                            </span>
                          ))}
                          {(!emp.skills || emp.skills.length === 0) && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No skills listed</span>
                          )}
                        </div>
                      </td>
                      {isAdminOrHR && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Link to={`/employees/edit/${emp.id}`} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
                              <FileEdit size={14} />
                            </Link>
                            <button onClick={() => handleDelete(emp.id)} className="btn btn-danger" style={{ padding: '6px 10px', border: 'none' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={isAdminOrHR ? 6 : 5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No employees found matching the current search parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Showing page {page} of {totalPages} (Total: {total} employees)
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
    </div>
  );
};

export default EmployeeList;

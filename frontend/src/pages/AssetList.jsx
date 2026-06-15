import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assetStart, fetchAssetsSuccess, assetFailure, assetActionSuccess } from '../store/slices/assetSlice.js';
import api from '../services/api.js';
import { Monitor, Plus, Check, Undo2, Ban } from 'lucide-react';

const AssetList = () => {
  const { assets, total, page, totalPages, loading } = useSelector((state) => state.asset);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Registration Form
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');

  // Allocation Form
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [activeEmployees, setActiveEmployees] = useState([]);

  const fetchAssets = async () => {
    dispatch(assetStart());
    try {
      const res = await api.get('/assets', {
        params: {
          page: currentPage,
          limit: 8,
          status: statusFilter,
        },
      });
      dispatch(fetchAssetsSuccess(res.data.data));
    } catch (err) {
      dispatch(assetFailure(err.response?.data?.message || 'Failed to fetch asset list.'));
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await api.get('/employees', { params: { limit: 100 } });
      setActiveEmployees(res.data.data.data);
    } catch (err) {
      console.error('Failed to fetch employee list:', err.message);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter]);

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    if (!assetName || !serialNumber) return;

    try {
      await api.post('/assets', {
        name: assetName,
        type: assetType,
        serialNumber,
      });
      alert('Asset registered successfully.');
      setAssetName('');
      setSerialNumber('');
      setShowAddModal(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register asset. Ensure S/N is unique.');
    }
  };

  const openAssignModal = (assetId) => {
    setSelectedAssetId(assetId);
    fetchEmployeesList();
    setShowAssignModal(true);
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedAssetId) return;

    try {
      await api.post(`/assets/${selectedAssetId}/assign`, {
        employeeId: selectedEmployeeId,
      });
      alert('Asset allocated successfully.');
      setSelectedEmployeeId('');
      setSelectedAssetId('');
      setShowAssignModal(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate asset.');
    }
  };

  const handleReturnAsset = async (id) => {
    if (!window.confirm('Are you sure you want to mark this asset as returned?')) return;

    try {
      await api.post(`/assets/${id}/return`);
      alert('Asset returned successfully.');
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record asset return.');
    }
  };

  const isAdminOrHR = ['ADMIN', 'HR'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px' }}>Asset Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track hardware configurations and allocation logs</p>
        </div>
        {isAdminOrHR && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px' }}>Device Registry</h3>
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
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Allocated</option>
            <option value="UNDER_REPAIR">Under Repair</option>
          </select>
        </div>
      </div>

      {/* Asset List Grid */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Loading asset files...</p>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Type</th>
                    <th>Serial Number</th>
                    <th>Status</th>
                    <th>Allocated To</th>
                    {isAdminOrHR && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    let badgeClass = 'badge-active';
                    if (asset.status === 'ASSIGNED') badgeClass = 'badge-pending';
                    if (asset.status === 'UNDER_REPAIR') badgeClass = 'badge-rejected';

                    return (
                      <tr key={asset.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                              <Monitor size={18} />
                            </div>
                            <span style={{ fontWeight: 600 }}>{asset.name}</span>
                          </div>
                        </td>
                        <td>{asset.type}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '14px' }}>{asset.serialNumber}</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{asset.status}</span>
                        </td>
                        <td>
                          {asset.employee ? (
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 500 }}>{asset.employee.firstName} {asset.employee.lastName}</p>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned: {new Date(asset.assignedAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>—</span>
                          )}
                        </td>
                        {isAdminOrHR && (
                          <td style={{ textAlign: 'right' }}>
                            {asset.status === 'AVAILABLE' ? (
                              <button onClick={() => openAssignModal(asset.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                                <Check size={14} />
                                <span>Allocate</span>
                              </button>
                            ) : asset.status === 'ASSIGNED' ? (
                              <button onClick={() => handleReturnAsset(asset.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                                <Undo2 size={14} />
                                <span>Record Return</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}><Ban size={14} /> Locked</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={isAdminOrHR ? 6 : 5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No inventory assets listed.
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
                  Page {page} of {totalPages} (Total: {total} items)
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

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>Add Hardware Device</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterAsset}>
              <div className="form-group">
                <label className="form-label">Asset Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MacBook Pro M3"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Device Type</label>
                <select className="form-control" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                  <option value="LAPTOP">Laptop Computer</option>
                  <option value="MONITOR">External Monitor</option>
                  <option value="MOBILE">Mobile Phone</option>
                  <option value="KEYBOARD">Keyboard / Mouse</option>
                  <option value="HEADSET">Audio Headset</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. C02F8XYZQ05D"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>Allocate Device</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAssignAsset}>
              <div className="form-group">
                <label className="form-label">Select Employee</label>
                <select
                  className="form-control"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  required
                >
                  <option value="">Choose Employee...</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;

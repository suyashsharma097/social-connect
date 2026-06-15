import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStart, fetchEmployeeByIdSuccess, fetchMastersSuccess, clearCurrentEmployee } from '../store/slices/employeeSlice.js';
import api from '../services/api.js';
import { Save, ArrowLeft, Plus, X, Upload } from 'lucide-react';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentEmployee, departments, skills, loading } = useSelector((state) => state.employee);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [hireDate, setHireDate] = useState('');

  // Skills
  const [selectedSkills, setSelectedSkills] = useState([]); // [{ skillId, name, proficiencyLevel }]
  const [tempSkillId, setTempSkillId] = useState('');
  const [tempLevel, setTempLevel] = useState('INTERMEDIATE');

  // Files
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  // Messages
  const [errorMsg, setErrorMsg] = useState('');

  const loadMasters = async () => {
    try {
      const [dRes, sRes] = await Promise.all([
        api.get('/masters/departments'),
        api.get('/masters/skills'),
      ]);
      dispatch(fetchMastersSuccess({
        departments: dRes.data.data.departments,
        skills: sRes.data.data.skills,
      }));
    } catch (err) {
      console.error('Failed to load masters lists:', err.message);
    }
  };

  const loadEmployee = async () => {
    dispatch(fetchStart());
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data.data.employee;
      dispatch(fetchEmployeeByIdSuccess(emp));

      // Prefill fields
      setFirstName(emp.firstName);
      setLastName(emp.lastName);
      setEmail(emp.email);
      setPhone(emp.phone || '');
      setDepartmentId(emp.departmentId || '');
      setSalary(emp.salary);
      setStatus(emp.status);
      setHireDate(emp.hireDate ? new Date(emp.hireDate).toISOString().split('T')[0] : '');
      
      const mappedSkills = emp.skills.map((s) => ({
        skillId: s.skillId,
        name: s.skill?.name,
        proficiencyLevel: s.proficiencyLevel,
      }));
      setSelectedSkills(mappedSkills);
    } catch (err) {
      setErrorMsg('Failed to load employee details.');
    }
  };

  useEffect(() => {
    loadMasters();
    if (isEdit) {
      loadEmployee();
    } else {
      dispatch(clearCurrentEmployee());
      // Defaults for Create
      setHireDate(new Date().toISOString().split('T')[0]);
    }
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [id]);

  const addSkillTag = () => {
    if (!tempSkillId) return;
    const exists = selectedSkills.find((s) => s.skillId === tempSkillId);
    if (exists) return;

    const skillObj = skills.find((s) => s.id === tempSkillId);
    setSelectedSkills([...selectedSkills, {
      skillId: tempSkillId,
      name: skillObj.name,
      proficiencyLevel: tempLevel,
    }]);
    setTempSkillId('');
  };

  const removeSkillTag = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skillId));
  };

  const handleDocumentChange = (e) => {
    setDocumentFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('departmentId', departmentId);
    formData.append('salary', salary);
    formData.append('status', status);
    formData.append('hireDate', hireDate);

    // Append skills list as JSON string
    formData.append('skills', JSON.stringify(selectedSkills));

    // Append files
    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    documentFiles.forEach((file) => {
      formData.append('documents', file);
    });

    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/employees');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save employee profile. Make sure email is unique.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '28px' }}>{isEdit ? 'Edit Employee Profile' : 'Create Employee Profile'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{isEdit ? 'Update details, upload documents, and sync skills' : 'Create new corporate employee file'}</p>
        </div>
        <button onClick={() => navigate('/employees')} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          color: 'var(--danger)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          marginBottom: '20px',
          borderLeft: '3px solid var(--danger)'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px' }}>
        <div className="form-grid">
          {/* First Name */}
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit} // Disable email edit for integrity
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. +1 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-control"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="form-group">
            <label className="form-label">Annual Salary (USD)</label>
            <input
              type="number"
              className="form-control"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>

          {/* Hire Date */}
          <div className="form-group">
            <label className="form-label">Hire Date</label>
            <input
              type="date"
              className="form-control"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Skills Profiler */}
        <div style={{ marginTop: '20px', padding: '20px 0', borderTop: '1px solid var(--glass-border)' }}>
          <label className="form-label">Add Candidate Skills</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <select
                className="form-control"
                value={tempSkillId}
                onChange={(e) => setTempSkillId(e.target.value)}
              >
                <option value="">Select Skill</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-control"
                value={tempLevel}
                onChange={(e) => setTempLevel(e.target.value)}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <button type="button" onClick={addSkillTag} className="btn btn-secondary">
              <Plus size={16} />
              <span>Add Skill</span>
            </button>
          </div>

          <div className="skills-list">
            {selectedSkills.map((s) => (
              <span key={s.skillId} className="skill-chip">
                <span>{s.name} ({s.proficiencyLevel})</span>
                <button type="button" onClick={() => removeSkillTag(s.skillId)}>
                  <X size={14} />
                </button>
              </span>
            ))}
            {selectedSkills.length === 0 && (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No skills added yet.</span>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div style={{ marginTop: '20px', padding: '20px 0', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Upload Documents</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {/* Profile Picture */}
            <div>
              <label className="form-label">Profile Image</label>
              <div className="file-upload-box" style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files[0])}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}
                />
                <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px' }}>
                  {profileImageFile ? profileImageFile.name : 'Choose Avatar Image'}
                </p>
              </div>
            </div>

            {/* Resume */}
            <div>
              <label className="form-label">Resume / CV</label>
              <div className="file-upload-box" style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}
                />
                <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px' }}>
                  {resumeFile ? resumeFile.name : 'Choose Resume PDF'}
                </p>
              </div>
            </div>

            {/* Other Documents */}
            <div>
              <label className="form-label">Documents (Certificates/ID)</label>
              <div className="file-upload-box" style={{ position: 'relative' }}>
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentChange}
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }}
                />
                <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px' }}>
                  {documentFiles.length > 0 ? `${documentFiles.length} files selected` : 'Choose files (Max 5)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/employees')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            <span>{loading ? 'Saving Profile...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;

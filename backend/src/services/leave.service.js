import leaveRepository from '../repositories/leave.repository.js';
import employeeRepository from '../repositories/employee.repository.js';
import AppError from '../utils/appError.js';
import { sendEmail } from '../config/mail.js';

const applyLeave = async (user, body) => {
  if (!user.employee) {
    throw new AppError('Only users with an employee profile can apply for leave.', 400);
  }

  const employeeId = user.employee.id;

  const leaveData = {
    employeeId,
    leaveType: body.leaveType,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    reason: body.reason,
    status: 'PENDING_MANAGER', // default status
  };

  const leave = await leaveRepository.createLeave(leaveData);

  // Send email to department manager or admin if possible (simulated mock)
  try {
    // Notify Admin/HR
    const textHtml = `
      <h3>New Leave Application Request</h3>
      <p><strong>Employee:</strong> ${user.employee.firstName} ${user.employee.lastName}</p>
      <p><strong>Type:</strong> ${body.leaveType}</p>
      <p><strong>Duration:</strong> ${body.startDate} to ${body.endDate}</p>
      <p><strong>Reason:</strong> ${body.reason}</p>
      <p>Please log in to the portal to review this request.</p>
    `;
    await sendEmail('hr@social-connect.com', 'New Leave Request - Social Connect', textHtml);
  } catch (err) {
    console.error('Failed to send leave notification email:', err.message);
  }

  return leave;
};

const reviewLeave = async (reviewer, id, body) => {
  const { status, comment } = body;
  const reviewerRole = reviewer.role; // ADMIN, HR, MANAGER

  // Verify leave exists
  const leave = await leaveRepository.findLeaveById(id);
  if (!leave) {
    throw new AppError('Leave request not found.', 404);
  }

  const updatedLeave = await leaveRepository.updateLeaveStatus(
    id,
    status,
    reviewer.id,
    comment,
    reviewerRole
  );

  // Notify Employee of state update
  try {
    const employeeEmail = updatedLeave.employee.email;
    const textHtml = `
      <h3>Leave Application Update</h3>
      <p>Hello ${updatedLeave.employee.firstName},</p>
      <p>Your leave request from <strong>${updatedLeave.startDate.toDateString()}</strong> to <strong>${updatedLeave.endDate.toDateString()}</strong> has been updated.</p>
      <p><strong>New Status:</strong> ${updatedLeave.status}</p>
      <p><strong>Comment:</strong> ${comment || 'No comment provided.'}</p>
      <p>Best Regards,<br/>HR Department</p>
    `;
    await sendEmail(employeeEmail, 'Leave Request Update - Social Connect', textHtml);
  } catch (err) {
    console.error('Failed to send status update notification:', err.message);
  }

  return updatedLeave;
};

const getLeaveBalances = async (user) => {
  if (!user.employee) {
    throw new AppError('No employee profile associated with this account.', 400);
  }
  return leaveRepository.getLeaveBalances(user.employee.id);
};

const getLeavesList = async (user, query) => {
  let employeeId = '';

  // Non-admins and non-HRs can only see their own leaves
  if (user.role === 'EMPLOYEE') {
    if (!user.employee) {
      return { total: 0, page: 1, limit: 10, totalPages: 0, data: [] };
    }
    employeeId = user.employee.id;
  }

  return leaveRepository.getLeaves({
    status: query.status,
    employeeId,
    page: parseInt(query.page),
    limit: parseInt(query.limit),
  });
};

export default {
  applyLeave,
  reviewLeave,
  getLeaveBalances,
  getLeavesList,
};

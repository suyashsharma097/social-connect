import prisma from '../config/db.js';
import AppError from '../utils/appError.js';

const findLeaveById = async (id) => {
  return prisma.leave.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
  });
};

const createLeave = async (leaveData) => {
  return prisma.$transaction(async (tx) => {
    // 1. Calculate leave days
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 2. Check balance
    const currentBalance = await tx.leaveBalance.findUnique({
      where: {
        employeeId_leaveType: {
          employeeId: leaveData.employeeId,
          leaveType: leaveData.leaveType,
        },
      },
    });

    if (!currentBalance || (leaveData.leaveType !== 'UNPAID' && currentBalance.balance < diffDays)) {
      throw new AppError(
        `Insufficient leave balance. Requested: ${diffDays} days, Available: ${currentBalance?.balance || 0} days.`,
        400
      );
    }

    // 3. Create leave request
    return tx.leave.create({
      data: leaveData,
    });
  });
};

const updateLeaveStatus = async (id, status, reviewerId, comment, reviewerRole) => {
  return prisma.$transaction(async (tx) => {
    const leave = await tx.leave.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status === 'APPROVED' || leave.status === 'REJECTED') {
      throw new AppError('This leave request has already been finalized.', 400);
    }

    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let updateData = {};

    if (reviewerRole === 'MANAGER') {
      if (leave.status !== 'PENDING_MANAGER') {
        throw new AppError('Leave request is not pending Manager approval.', 400);
      }
      if (status === 'APPROVED') {
        // Move to PENDING_HR for final HR approval
        updateData.status = 'PENDING_HR';
        updateData.managerId = reviewerId;
        updateData.managerComment = comment;
      } else {
        updateData.status = 'REJECTED';
        updateData.managerId = reviewerId;
        updateData.managerComment = comment;
      }
    } else if (reviewerRole === 'HR' || reviewerRole === 'ADMIN') {
      // HR/Admin can directly approve/reject PENDING_HR or override PENDING_MANAGER if needed
      updateData.status = status; // APPROVED or REJECTED
      updateData.hrId = reviewerId;
      updateData.hrComment = comment;

      // If approved, deduct the leave balance
      if (status === 'APPROVED') {
        // Find current balance
        const balanceRecord = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveType: {
              employeeId: leave.employeeId,
              leaveType: leave.leaveType,
            },
          },
        });

        if (leave.leaveType !== 'UNPAID') {
          if (!balanceRecord || balanceRecord.balance < diffDays) {
            throw new AppError('Cannot approve leave: employee does not have sufficient leave balance.', 400);
          }

          // Deduct balance
          await tx.leaveBalance.update({
            where: {
              employeeId_leaveType: {
                employeeId: leave.employeeId,
                leaveType: leave.leaveType,
              },
            },
            data: {
              balance: {
                decrement: diffDays,
              },
            },
          });
        }
      }
    }

    return tx.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });
  });
};

const getLeaveBalances = async (employeeId) => {
  return prisma.leaveBalance.findMany({
    where: { employeeId },
  });
};

const getLeaves = async ({ status = 'ALL', employeeId = '', page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const whereClause = {};

  if (status !== 'ALL') {
    whereClause.status = status;
  }

  if (employeeId) {
    whereClause.employeeId = employeeId;
  }

  const [total, data] = await Promise.all([
    prisma.leave.count({ where: whereClause }),
    prisma.leave.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
};

export default {
  findLeaveById,
  createLeave,
  updateLeaveStatus,
  getLeaveBalances,
  getLeaves,
};

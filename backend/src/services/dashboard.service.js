import prisma from '../config/db.js';

const getSystemStats = async () => {
  const [
    totalEmployees,
    pendingLeaves,
    totalAssets,
    assignedAssets,
    departments,
    leavesBreakdown
  ] = await Promise.all([
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.leave.count({ where: { status: { in: ['PENDING_MANAGER', 'PENDING_HR'] } } }),
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'ASSIGNED' } }),
    prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    }),
    prisma.leave.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    }),
  ]);

  const departmentData = departments.map((d) => ({
    name: d.name,
    count: d._count.employees,
  }));

  const leaveStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  leavesBreakdown.forEach((group) => {
    if (group.status === 'PENDING_MANAGER' || group.status === 'PENDING_HR') {
      leaveStats.pending += group._count.id;
    } else if (group.status === 'APPROVED') {
      leaveStats.approved = group._count.id;
    } else if (group.status === 'REJECTED') {
      leaveStats.rejected = group._count.id;
    }
  });

  return {
    employees: {
      totalActive: totalEmployees,
      byDepartment: departmentData,
    },
    leaves: {
      pending: pendingLeaves,
      stats: leaveStats,
    },
    assets: {
      total: totalAssets,
      assigned: assignedAssets,
      available: totalAssets - assignedAssets,
    },
  };
};

const getEmployeeStats = async (employeeId) => {
  const [
    leaveBalances,
    leaves,
    assets,
  ] = await Promise.all([
    prisma.leaveBalance.findMany({
      where: { employeeId },
    }),
    prisma.leave.findMany({
      where: { employeeId },
    }),
    prisma.asset.findMany({
      where: { employeeId },
    }),
  ]);

  const leaveStats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'PENDING_MANAGER' || l.status === 'PENDING_HR').length,
    approved: leaves.filter((l) => l.status === 'APPROVED').length,
    rejected: leaves.filter((l) => l.status === 'REJECTED').length,
  };

  return {
    balances: leaveBalances.map((b) => ({
      type: b.leaveType,
      balance: b.balance,
    })),
    leaves: leaveStats,
    assets: assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      serialNumber: a.serialNumber,
      assignedAt: a.assignedAt,
    })),
  };
};

const getDashboardStats = async (user) => {
  if (user.role === 'ADMIN' || user.role === 'HR' || user.role === 'MANAGER') {
    const systemStats = await getSystemStats();
    // If they also have an employee profile, merge employee stats
    if (user.employee) {
      const employeeStats = await getEmployeeStats(user.employee.id);
      return {
        role: user.role,
        system: systemStats,
        personal: employeeStats,
      };
    }
    return {
      role: user.role,
      system: systemStats,
    };
  }

  // Employee standard stats
  if (!user.employee) {
    return {
      role: user.role,
      personal: {
        balances: [],
        leaves: { total: 0, pending: 0, approved: 0, rejected: 0 },
        assets: [],
      },
    };
  }

  const personalStats = await getEmployeeStats(user.employee.id);
  return {
    role: user.role,
    personal: personalStats,
  };
};

export default {
  getDashboardStats,
};

import prisma from '../config/db.js';

const findById = async (id) => {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      skills: {
        include: {
          skill: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
        },
      },
    },
  });
};

const findByEmail = async (email) => {
  return prisma.employee.findUnique({
    where: { email },
  });
};

const createEmployee = async (employeeData, skillsList = []) => {
  return prisma.$transaction(async (tx) => {
    const { userId, ...cleanEmployeeData } = employeeData;
    // 1. Create the employee record
    const employee = await tx.employee.create({
      data: {
        ...cleanEmployeeData,
        // If userId is provided, associate the user
        user: userId ? {
          connect: { id: userId }
        } : undefined,
      },
    });

    // 2. Link skills if provided
    if (skillsList && skillsList.length > 0) {
      const skillRelations = skillsList.map((s) => ({
        skillId: s.skillId,
        proficiencyLevel: s.proficiencyLevel || 'INTERMEDIATE',
      }));

      await tx.employee.update({
        where: { id: employee.id },
        data: {
          skills: {
            create: skillRelations,
          },
        },
      });
    }

    // 3. Initialize default LeaveBalances
    const leaveTypes = ['SICK', 'CASUAL', 'ANNUAL', 'UNPAID'];
    const balances = leaveTypes.map((type) => ({
      employeeId: employee.id,
      leaveType: type,
      balance: type === 'UNPAID' ? 99 : 12, // default 12 days for paid leaves
    }));

    await tx.leaveBalance.createMany({
      data: balances,
    });

    return tx.employee.findUnique({
      where: { id: employee.id },
      include: {
        department: true,
        skills: {
          include: { skill: true },
        },
      },
    });
  });
};

const updateEmployee = async (id, employeeData, skillsList = null) => {
  return prisma.$transaction(async (tx) => {
    // 1. Update basic employee data
    await tx.employee.update({
      where: { id },
      data: employeeData,
    });

    // 2. If skills are provided, overwrite the previous associations
    if (skillsList !== null) {
      // Clear old skills
      await tx.employeeSkill.deleteMany({
        where: { employeeId: id },
      });

      // Insert new skills
      if (skillsList.length > 0) {
        const skillRelations = skillsList.map((s) => ({
          skillId: s.skillId,
          proficiencyLevel: s.proficiencyLevel || 'INTERMEDIATE',
        }));

        await tx.employee.update({
          where: { id },
          data: {
            skills: {
              create: skillRelations,
            },
          },
        });
      }
    }

    return tx.employee.findUnique({
      where: { id },
      include: {
        department: true,
        skills: {
          include: { skill: true },
        },
      },
    });
  });
};

const deleteEmployee = async (id) => {
  return prisma.$transaction(async (tx) => {
    // Get associated user
    const employee = await tx.employee.findUnique({
      where: { id },
      select: { userId: true },
    });

    // Delete employee (will cascade delete EmployeeSkill relations, leave, etc. depending on Prisma schema cascades)
    const deleted = await tx.employee.delete({
      where: { id },
    });

    // If there is an associated user, delete it too
    if (employee && employee.userId) {
      await tx.user.delete({
        where: { id: employee.userId },
      });
    }

    return deleted;
  });
};

const findAll = async ({ page = 1, limit = 10, search = '', departmentId = '' }) => {
  const skip = (page - 1) * limit;

  const whereClause = {};

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (departmentId) {
    whereClause.departmentId = departmentId;
  }

  const [total, data] = await Promise.all([
    prisma.employee.count({ where: whereClause }),
    prisma.employee.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        department: true,
        skills: {
          include: {
            skill: true,
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
  findById,
  findByEmail,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  findAll,
};

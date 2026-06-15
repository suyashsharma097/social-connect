import prisma from '../config/db.js';

const getDepartments = async () => {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
};

const createDepartment = async (data) => {
  return prisma.department.create({
    data,
  });
};

const getSkills = async () => {
  return prisma.skill.findMany({
    orderBy: { name: 'asc' },
  });
};

const createSkill = async (data) => {
  return prisma.skill.create({
    data,
  });
};

export default {
  getDepartments,
  createDepartment,
  getSkills,
  createSkill,
};

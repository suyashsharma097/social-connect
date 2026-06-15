import prisma from '../config/db.js';

const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { employee: true },
  });
};

const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: { employee: true },
  });
};

const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

const findByVerificationToken = async (token) => {
  return prisma.user.findFirst({
    where: { verificationToken: token },
  });
};

const findByResetToken = async (token) => {
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });
};

export default {
  findByEmail,
  findById,
  createUser,
  updateUser,
  findByVerificationToken,
  findByResetToken,
};

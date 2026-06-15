import prisma from '../config/db.js';
import AppError from '../utils/appError.js';

const findAssetById = async (id) => {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });
};

const createAsset = async (assetData) => {
  return prisma.asset.create({
    data: assetData,
  });
};

const updateAsset = async (id, assetData) => {
  return prisma.asset.update({
    where: { id },
    data: assetData,
    include: { employee: true },
  });
};

const getAssets = async ({ status = 'ALL', page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const whereClause = {};

  if (status !== 'ALL') {
    whereClause.status = status;
  }

  const [total, data] = await Promise.all([
    prisma.asset.count({ where: whereClause }),
    prisma.asset.findMany({
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
  findAssetById,
  createAsset,
  updateAsset,
  getAssets,
};

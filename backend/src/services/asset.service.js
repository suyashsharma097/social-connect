import assetRepository from '../repositories/asset.repository.js';
import employeeRepository from '../repositories/employee.repository.js';
import AppError from '../utils/appError.js';

const createAsset = async (body) => {
  return assetRepository.createAsset({
    name: body.name,
    type: body.type,
    serialNumber: body.serialNumber,
    status: body.status || 'AVAILABLE',
  });
};

const assignAsset = async (id, body) => {
  const asset = await assetRepository.findAssetById(id);
  if (!asset) {
    throw new AppError('Asset not found.', 404);
  }

  if (asset.status === 'ASSIGNED') {
    throw new AppError('Asset is already assigned to another employee.', 400);
  }

  // Verify employee exists
  const employee = await employeeRepository.findById(body.employeeId);
  if (!employee) {
    throw new AppError('Employee not found.', 404);
  }

  return assetRepository.updateAsset(id, {
    status: 'ASSIGNED',
    employeeId: body.employeeId,
    assignedAt: new Date(),
    returnedAt: null,
  });
};

const returnAsset = async (id) => {
  const asset = await assetRepository.findAssetById(id);
  if (!asset) {
    throw new AppError('Asset not found.', 404);
  }

  if (asset.status !== 'ASSIGNED') {
    throw new AppError('Asset is not currently assigned.', 400);
  }

  return assetRepository.updateAsset(id, {
    status: 'AVAILABLE',
    employeeId: null,
    returnedAt: new Date(),
  });
};

const getAssets = async (query) => {
  return assetRepository.getAssets({
    status: query.status,
    page: parseInt(query.page),
    limit: parseInt(query.limit),
  });
};

export default {
  createAsset,
  assignAsset,
  returnAsset,
  getAssets,
};

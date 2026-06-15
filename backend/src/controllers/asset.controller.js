import assetService from '../services/asset.service.js';
import logger from '../config/logger.js';

const createAsset = async (req, res, next) => {
  try {
    logger.info('Registering new asset.');
    const asset = await assetService.createAsset(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Asset registered successfully.',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

const assignAsset = async (req, res, next) => {
  try {
    logger.info(`Assigning asset ID ${req.params.id} to employee ${req.body.employeeId}`);
    const asset = await assetService.assignAsset(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Asset assigned successfully.',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

const returnAsset = async (req, res, next) => {
  try {
    logger.info(`Returning asset ID ${req.params.id}`);
    const asset = await assetService.returnAsset(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Asset returned successfully.',
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const query = {
      status: req.query.status || 'ALL',
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const result = await assetService.getAssets(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createAsset,
  assignAsset,
  returnAsset,
  getAssets,
};

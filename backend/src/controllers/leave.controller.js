import leaveService from '../services/leave.service.js';
import logger from '../config/logger.js';

const applyLeave = async (req, res, next) => {
  try {
    logger.info(`User ${req.user.email} is applying for leave.`);
    const leave = await leaveService.applyLeave(req.user, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Leave application submitted successfully.',
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

const reviewLeave = async (req, res, next) => {
  try {
    logger.info(`User ${req.user.email} (${req.user.role}) is reviewing leave ID ${req.params.id}`);
    const leave = await leaveService.reviewLeave(req.user, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: `Leave request status updated to ${leave.status}.`,
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

const getBalances = async (req, res, next) => {
  try {
    const balances = await leaveService.getLeaveBalances(req.user);
    res.status(200).json({
      status: 'success',
      data: { balances },
    });
  } catch (error) {
    next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const query = {
      status: req.query.status || 'ALL',
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const result = await leaveService.getLeavesList(req.user, query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  applyLeave,
  reviewLeave,
  getBalances,
  getLeaves,
};

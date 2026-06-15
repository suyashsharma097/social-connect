import Joi from 'joi';

const applyLeave = {
  body: Joi.object().keys({
    leaveType: Joi.string().valid('SICK', 'CASUAL', 'ANNUAL', 'UNPAID').required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    reason: Joi.string().required().max(500),
  }),
};

const reviewLeave = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('APPROVED', 'REJECTED').required(),
    comment: Joi.string().allow('', null).max(500),
  }),
};

const getLeaves = {
  query: Joi.object().keys({
    status: Joi.string().valid('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'ALL').default('ALL'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

export default {
  applyLeave,
  reviewLeave,
  getLeaves,
};

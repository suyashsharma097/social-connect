import Joi from 'joi';

const createAsset = {
  body: Joi.object().keys({
    name: Joi.string().required().max(100),
    type: Joi.string().required().max(50),
    serialNumber: Joi.string().required().max(100),
    status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR').default('AVAILABLE'),
  }),
};

const assignAsset = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    employeeId: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const returnAsset = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const getAssets = {
  query: Joi.object().keys({
    status: Joi.string().valid('AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'ALL').default('ALL'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

export default {
  createAsset,
  assignAsset,
  returnAsset,
  getAssets,
};

import Joi from 'joi';

const createEmployee = {
  body: Joi.object().keys({
    firstName: Joi.string().required().max(50),
    lastName: Joi.string().required().max(50),
    email: Joi.string().required().email(),
    phone: Joi.string().allow('', null),
    departmentId: Joi.string().guid({ version: 'uuidv4' }).allow('', null),
    hireDate: Joi.date().iso().allow('', null),
    salary: Joi.number().required().min(0),
    status: Joi.string().valid('ACTIVE', 'LEAVE', 'TERMINATED').default('ACTIVE'),
    skills: Joi.string().allow('', null), // Skills are sent as JSON string due to multipart form-data
  }),
};

const updateEmployee = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object().keys({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    departmentId: Joi.string().guid({ version: 'uuidv4' }).allow('', null),
    hireDate: Joi.date().iso(),
    salary: Joi.number().min(0),
    status: Joi.string().valid('ACTIVE', 'LEAVE', 'TERMINATED'),
    skills: Joi.string().allow('', null), // JSON string
  }),
};

const deleteEmployee = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const getEmployee = {
  params: Joi.object().keys({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};

const queryEmployees = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow(''),
    departmentId: Joi.string().guid({ version: 'uuidv4' }).allow(''),
  }),
};

export default {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
  queryEmployees,
};

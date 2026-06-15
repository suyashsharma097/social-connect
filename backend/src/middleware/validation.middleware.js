import Joi from 'joi';
import AppError from '../utils/appError.js';

const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  
  // Extract keys to validate
  if (schema.body) validSchema.body = schema.body;
  if (schema.query) validSchema.query = schema.query;
  if (schema.params) validSchema.params = schema.params;

  const object = {};
  Object.keys(validSchema).forEach((key) => {
    if (req[key]) {
      object[key] = req[key];
    }
  });

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new AppError(errorMessage, 400));
  }

  Object.assign(req, value);
  return next();
};

export default validate;

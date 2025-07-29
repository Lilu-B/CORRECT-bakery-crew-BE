const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Name is required'
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters'
  }),
  role: Joi.string().valid('user', 'manager', 'developer').optional(),
  phone: Joi.string().allow(null, '').optional(),
  shift: Joi.string().valid('1st', '2nd').required().messages({
    'any.only': 'Valid shift is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Valid email is required',
    'string.empty': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
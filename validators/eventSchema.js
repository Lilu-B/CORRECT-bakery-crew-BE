const Joi = require('joi');

const eventSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required'
}),
  description: Joi.string().allow('').optional(),
//   date: Joi.date().iso().required().messages({
//     'date.format': 'Valid ISO date required',
//   }),
  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
        'string.pattern.base': 'Valid ISO date required',
        'any.required': 'Date is required'
  }),
  shift: Joi.string().valid('1st', '2nd', 'night').required().messages({
    'any.only': 'Invalid shift',
    'any.required': 'Shift is required',
  }),
});

module.exports = eventSchema;
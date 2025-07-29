const Joi = require('joi');

const createDonationSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required'
  }),
  deadline: Joi.date().iso().optional().messages({
    'date.format': 'Invalid date'
  })
});

const confirmPaymentSchema = Joi.object({
  amount: Joi.number().required().messages({
    'any.required': 'Amount is required',
    'number.base': 'Amount must be a number'
  })
});

module.exports = { createDonationSchema, confirmPaymentSchema };
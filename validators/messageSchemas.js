const Joi = require('joi');

const sendMessageSchema = Joi.object({
  recipient_id: Joi.number().integer().required().messages({
    'number.base': 'Recipient ID must be a number',
    'any.required': 'Recipient ID is required'
  }),
  content: Joi.string().min(1).required().messages({
    'string.base': 'Message content must be a string',
    'string.empty': 'Message content is required'
  })
});

module.exports = {
  sendMessageSchema
};
const Joi = require('joi');

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {

      console.log('❌ Joi validation error:', error.details);
      
      const errorDetails = error.details.map(detail => ({
        msg: detail.message,
        path: detail.path,
      }));
      return res.status(400).json({ errors: errorDetails });
    }

    next();
  };
};

module.exports = validateRequest;
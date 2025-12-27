const Joi = require('joi');

const documentSchema = Joi.object({
  document_type: Joi.string().required(),
  description: Joi.string().allow('', null)
});

module.exports = { documentSchema };

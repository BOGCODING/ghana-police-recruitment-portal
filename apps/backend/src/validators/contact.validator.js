const Joi = require('joi');

const contactSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  alternatePhone: Joi.string().allow('', null),
  residentialAddress: Joi.string().required(),
  postalAddress: Joi.string().allow('', null),
  digitalAddress: Joi.string().required(),
  emergencyContactName: Joi.string().required(),
  emergencyContactPhone: Joi.string().required(),
  emergencyContactRelation: Joi.string().required()
});

module.exports = { contactSchema };

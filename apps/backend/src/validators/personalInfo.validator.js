const Joi = require('joi');

const personalInfoSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  middleName: Joi.string().allow('', null),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  dateOfBirth: Joi.date().required(),
  placeOfBirth: Joi.string().required(),
  hometown: Joi.string().required(),
  regionOfOrigin: Joi.string().required(),
  ghanaCardNumber: Joi.string().required(),
  maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED').required(),
  residentialAddress: Joi.string().required(),
  digitalAddress: Joi.string().required()
});

module.exports = { personalInfoSchema };

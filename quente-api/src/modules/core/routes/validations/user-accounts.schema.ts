import joi, { Schema } from 'joi';

const fields = {
  dniType: joi.string().required(),
  dni: joi.string().required(),
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  birthdate: joi.date(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  codePost: joi.string(),
  phone: joi.string(),
  address: joi.string(),
  roles: joi.array().items(joi.string()).required(),
  organizationId: joi.string(),
};

const UserAccountCreateSchema: Schema = joi.object({ ...fields });

const UserAccountUpdateSchema: Schema = joi.object({
  dniType: joi.string(),
  dni: joi.string(),
  firstName: joi.string(),
  lastName: joi.string(),
  birthdate: joi.date(),
  email: joi.string().email(),
  password: joi.string(),
  codePost: joi.string(),
  phone: joi.string(),
  address: joi.string(),
  roles: joi.array().items(joi.string()),
});

export { UserAccountCreateSchema, UserAccountUpdateSchema };

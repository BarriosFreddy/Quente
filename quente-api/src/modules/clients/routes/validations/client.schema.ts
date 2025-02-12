import joi, { Schema } from 'joi';

const ClientCreateSchema: Schema = joi.object({
  name: joi.string().required(),
  dniType: joi.string().required(),
  dni: joi.string().required(),
  email: joi.string().email().allow(''),
  phoneNumber: joi.string().allow(''),
  address: joi.string().allow(''),
});

const ClientUpdateSchema: Schema = joi.object({
  name: joi.string(),
  dniType: joi.string(),
  dni: joi.string(),
  email: joi.string().email().allow(''),
  phoneNumber: joi.string().allow(''),
  address: joi.string().allow(''),
  __v: joi.number(),
});

export { ClientCreateSchema, ClientUpdateSchema };

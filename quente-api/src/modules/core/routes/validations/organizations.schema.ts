import joi, { Schema } from 'joi';

const OrganizationCreateSchema: Schema = joi.object({
  name: joi.string().required(),
  nit: joi.string().required(),
  address: joi.string(),
  city: joi.string(),
  country: joi.string(),
  phoneNumber: joi.string(),
  logoLink: joi.string(),
  modifiedBy: joi.string(),
  createdAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
  updatedAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
});

const OrganizationUpdateSchema: Schema = joi.object({
  name: joi.string(),
  nit: joi.string(),
  address: joi.string(),
  city: joi.string(),
  country: joi.string(),
  phoneNumber: joi.string(),
  logoLink: joi.string(),
  status: joi.string(),
  createdAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
  updatedAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
  modifiedBy: joi.string(),
  __v: joi.number(),
});

export { OrganizationCreateSchema, OrganizationUpdateSchema };

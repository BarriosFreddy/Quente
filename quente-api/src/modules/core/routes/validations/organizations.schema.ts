import joi, { Schema } from 'joi';

const OrganizationCreateSchema: Schema = joi.object({
  uid: joi.string().required(),
  name: joi.string().required(),
  nit: joi.string().required(),
  logoLink: joi.string(),
  status: joi.string(),
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
  uid: joi.string(),
  name: joi.string(),
  nit: joi.string(),
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

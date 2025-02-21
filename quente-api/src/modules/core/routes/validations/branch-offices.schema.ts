import joi, { Schema } from 'joi';

const BranchOfficeCreateSchema: Schema = joi.object({
  organizationId: joi.string(),
  name: joi.string(),
  address: joi.string(),
  phoneNumber: joi.string(),
  country: joi.string(),
  city: joi.string(),
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

const BranchOfficeUpdateSchema: Schema = joi.object({
  organizationId: joi.string(),
  name: joi.string(),
  address: joi.string(),
  phoneNumber: joi.string(),
  country: joi.string(),
  city: joi.string(),
  modifiedBy: joi.string(),
  createdAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
  updatedAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
  __v: joi.number(),
});

export { BranchOfficeCreateSchema, BranchOfficeUpdateSchema };

import joi, { Schema } from 'joi';

const ItemCreateSchema: Schema = joi.object({
  _id: joi.string(),
  name: joi.string().required(),
  description: joi.string(),
  code: joi.string().required(),
  categoryId: joi.string().required(),
  reorderPoint: joi.number(),
  laboratory: joi.string().allow(''),
  sku: joi.string().allow(''),
  pricesRatio: joi.array().items(
    joi.object({
      price: joi.number().required(),
      cost: joi.number().required(),
      measurementUnit: joi.string().required(),
      hash: joi.string(),
      main: joi.string().allow(''),
      multiplicity: joi.number().required(),
      organizationId: joi.string().allow(''),
      totalCost: joi.number().required(),
      quantityPerPackage: joi.number().required(),
    }),
  ),
  expirationControl: joi.array().items(
    joi.object({
      lot: joi.string().allow(''),
      expirationDate: joi.string().allow(''),
      id: joi.string().allow(''),
      lotUnits: joi.number(),
    }),
  ),
});

const ItemUpdateSchema: Schema = joi.object({
  name: joi.string(),
  description: joi.string(),
  code: joi.string(),
  categoryId: joi.string(),
  reorderPoint: joi.number(),
  laboratory: joi.string().allow(''),
  sku: joi.string().allow(''),
  pricesRatio: joi.array().items(
    joi.object({
      _id: joi.string(),
      price: joi.number().required(),
      cost: joi.number().required(),
      measurementUnit: joi.string().required(),
      hash: joi.string(),
      main: joi.string().allow(''),
      multiplicity: joi.number(),
      organizationId: joi.string().allow(''),
      totalCost: joi.number(),
      quantityPerPackage: joi.number(),
    }),
  ),
  expirationControl: joi.array().items(
    joi.object({
      _id: joi.string(),
      id: joi.string().allow(''),
      lot: joi.string().allow(''),
      expirationDate: joi.string().allow(''),
      lotUnits: joi.number(),
    }),
  ),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  __v: joi.number(),
});

export { ItemCreateSchema, ItemUpdateSchema };

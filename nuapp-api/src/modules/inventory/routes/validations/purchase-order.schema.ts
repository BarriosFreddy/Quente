import joi, { Schema } from 'joi';

const PurchaseOrderCreateSchema: Schema = joi.object({
  code: joi.string().required(),
  comments: joi.string().allow(''),
  items: joi.array().items(
    joi.object({
        name: joi.string(),
        units: joi.number(),
        measurementUnit: joi.string(),
        cost: joi.number(),
    })
  ),
  supplierId: joi.string().regex(/[a-fA-F\d]{24}/),
  createdAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
});


export { PurchaseOrderCreateSchema };

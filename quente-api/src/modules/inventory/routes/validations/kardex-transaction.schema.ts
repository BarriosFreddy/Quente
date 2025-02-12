import joi, { Schema } from 'joi';

const KardexBulkCreateSchema: Schema = joi.array().items(
  joi.object({
    itemCode: joi.string().required(),
    itemId: joi.string().required(),
    itemCost: joi.number().required(),
    itemPrice: joi.number().required(),
    units: joi.number().required(),
    type: joi.string().allow('IN', 'OUT'),
    createdAt: joi.object({
      date: joi.number(),
      offset: joi.number(),
    }),
  }),
);

export { KardexBulkCreateSchema };

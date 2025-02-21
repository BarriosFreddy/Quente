import joi, { Schema } from 'joi';

const BillingCreateSchema: Schema = joi.object({
  receivedAmount: joi.number().required(),
  billAmount: joi.number().required(),
  clientId: joi.string().required(),
  items: joi
    .array()
    .items(
      joi.object({
        _id: joi.string(),
        name: joi.string(),
        code: joi.string(),
        price: joi.number(),
        units: joi.number(),
        measurementUnit: joi.string(),
        multiplicity: joi.number(),
      }),
    )
    .required(),
  creationDate: joi.string().required(),
  client: joi.object({
    id: joi.string(),
    name: joi.string(),
  }),
  createdBy: joi.object({
    id: joi.string(),
    name: joi.string(),
  }),
  createdAt: joi.object({
    date: joi.number(),
    offset: joi.number(),
  }),
});

export { BillingCreateSchema };

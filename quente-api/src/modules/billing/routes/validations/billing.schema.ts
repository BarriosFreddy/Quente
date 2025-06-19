import joi, { Schema } from 'joi';
import { BillingStatus } from '../../db/schemas/billing.schema';

const BillingCreateSchema: Schema = joi.object({
  _id: joi.string(),
  code: joi.string(),
  receivedAmount: joi.number().required(),
  paymentMethod: joi.string().required(),
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
  seller: joi.object({
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
  status: joi.string().valid(...Object.values(BillingStatus)).default(BillingStatus.APPROVED),
});

export { BillingCreateSchema };

import joi, { Schema } from 'joi';

const InvEnumerationCreateSchema: Schema = joi.object({
  code: joi.string().required(),
  name: joi.string().required(),
  description: joi.string().allow('').allow(null).optional(),
  values: joi.array().items(
    joi.object({
      label: joi.string(),
      code: joi.string(),
    }),
  ).required(),
});

const InvEnumerationUpdateSchema: Schema = joi.object({
  code: joi.string(),
  name: joi.string(),
  description: joi.string(),
});

export { InvEnumerationCreateSchema, InvEnumerationUpdateSchema };

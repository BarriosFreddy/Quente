import joi, { Schema } from 'joi';

const EnumerationCreateSchema: Schema = joi.object({
  name: joi.string().required(),
  description: joi.string(),
  values: joi.array().items(
    joi.object({
      label: joi.string(),
      code: joi.string(),
    }),
  ).required(),
});

const EnumerationUpdateSchema: Schema = joi.object({
  name: joi.string(),
  description: joi.string(),
});

export { EnumerationCreateSchema, EnumerationUpdateSchema };

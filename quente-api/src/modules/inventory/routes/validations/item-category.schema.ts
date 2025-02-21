import joi, { Schema } from 'joi';

const CategoryCreateSchema: Schema = joi.object({
  code: joi.string().required(),
  name: joi.string().required(),
  description: joi.string(),
});

const CategoryUpdateSchema: Schema = joi.object({
  code: joi.string(),
  name: joi.string(),
  description: joi.string(),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  __v: joi.number(),
});

export { CategoryCreateSchema, CategoryUpdateSchema };

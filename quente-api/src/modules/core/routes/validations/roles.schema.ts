import joi, { Schema } from 'joi';

const RoleCreateSchema: Schema = joi.object({
  name: joi.string().required(),
  modulesAccess: joi
    .array()
    .items({
      moduleId: joi.string(),
      canSee: joi.boolean(),
      canCreate: joi.boolean(),
      canUpdate: joi.boolean(),
      canDelete: joi.boolean(),
      canExecute: joi.boolean(),
    })
    .required(),
  organizationId: joi.string(),
});

const RoleUpdateSchema: Schema = joi.object({
  name: joi.string(),
  modulesAccess: joi.array().items({
    moduleId: joi.string(),
    canSee: joi.boolean(),
    canCreate: joi.boolean(),
    canUpdate: joi.boolean(),
    canDelete: joi.boolean(),
    canExecute: joi.boolean(),
  }),
  organizationId: joi.string(),
});

export { RoleCreateSchema, RoleUpdateSchema };

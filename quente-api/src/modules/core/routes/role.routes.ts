import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import roleController from './controllers/roles.controller';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../entities/enums/modules-codes';
import { Privilege } from '../entities/enums/privileges';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
import { RoleCreateSchema, RoleUpdateSchema } from './validations/roles.schema';

const roleRouter = express.Router();

roleRouter.post(
  '/',
  validateBody(RoleCreateSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.CREATE),
  ),
  roleController.save,
);
roleRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(RoleUpdateSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.UPDATE),
  ),
  roleController.update,
);
roleRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.ACCESS),
  ),
  roleController.findOne,
);
roleRouter.get('/', isAuthenticated, roleController.findAll);

export default roleRouter;

import express from 'express';
import userAccountController from './controllers/user-accounts.controller';
import isAuthenticated from './../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';
import {
  UserAccountCreateSchema,
  UserAccountUpdateSchema,
} from './validations/user-accounts.schema';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { ModuleCode } from '../entities/enums/modules-codes';
import { Privilege } from '../entities/enums/privileges';
import { generateAuthKeyPair } from '../../../helpers/util/index';
const userAccountRouter = express.Router();

userAccountRouter.post(
  '/',
  validateBody(UserAccountCreateSchema),
  userAccountController.save,
);
userAccountRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(UserAccountUpdateSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.UPDATE),
  ),
  userAccountController.update,
);
userAccountRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.ACCESS),
  ),
  userAccountController.findOne,
);
userAccountRouter.get(
  '/',
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.ACCESS),
  ),
  userAccountController.findAll,
);

export default userAccountRouter;

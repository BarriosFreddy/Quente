import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import branchOfficeController from './controllers/branch-offices.controller';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../entities/enums/modules-codes';
import { Privilege } from '../entities/enums/privileges';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
import {
  BranchOfficeCreateSchema,
  BranchOfficeUpdateSchema,
} from './validations/branch-offices.schema';

const branchOfficeRouter = express.Router();

branchOfficeRouter.post(
  '/',
  validateBody(BranchOfficeCreateSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.CREATE),
  ),
  branchOfficeController.save,
);
branchOfficeRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(BranchOfficeUpdateSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.UPDATE),
  ),
  branchOfficeController.update,
);
branchOfficeRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(
    generateAuthKeyPair(ModuleCode.USER_ACCOUNT, Privilege.ACCESS),
  ),
  branchOfficeController.findOne,
);
branchOfficeRouter.get('/', isAuthenticated, branchOfficeController.findAll);

export default branchOfficeRouter;

import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { validateBody } from '../../../helpers/middleware/validation.middleware';

import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import { container } from 'tsyringe';
import { InvEnumerationCreateSchema } from './validations/inv-enumeration.schema';
import InvEnumerationController from './controllers/inv-enumeration.controller';

const invEnumerationRouter = express.Router();
const invEnumerationController = container.resolve(InvEnumerationController);

invEnumerationRouter.post(
  '/',
  validateBody(InvEnumerationCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  invEnumerationController.save,
);

invEnumerationRouter.get(
  '/',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  invEnumerationController.findAll,
);

invEnumerationRouter.get(
  '/code/:code',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  invEnumerationController.findByCode,
);


export default invEnumerationRouter;

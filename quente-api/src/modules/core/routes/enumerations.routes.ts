import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import enumerationsController from './controllers/enumerations.controller';
import {
  EnumerationCreateSchema,
  EnumerationUpdateSchema,
} from './validations/enumerations.schema';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../entities/enums/modules-codes';
import { Privilege } from '../entities/enums/privileges';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
const enumerationsRouter = express.Router();

enumerationsRouter.post(
  '/',
  validateBody(EnumerationCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  enumerationsController.save,
);
enumerationsRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(EnumerationUpdateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.UPDATE)),
  enumerationsController.update,
);
enumerationsRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  enumerationsController.findOne,
);

enumerationsRouter.get('/', isAuthenticated, enumerationsController.findAll);

export default enumerationsRouter;

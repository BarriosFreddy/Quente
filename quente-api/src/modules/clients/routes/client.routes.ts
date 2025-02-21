import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import clientController from './controllers/client.controller';
import {
  ClientCreateSchema,
  ClientUpdateSchema,
} from './validations/client.schema';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import { idSchema } from '../../../helpers/db/schemas/id.schema';

const clientRouter = express.Router();

clientRouter.post(
  '/',
  validateBody(ClientCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  clientController.save,
);
clientRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(ClientUpdateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.UPDATE)),
  clientController.update,
);
clientRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  clientController.findOne,
);
clientRouter.get(
  '/dni/:dni',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  clientController.findByDNI,
);
clientRouter.get(
  '/dni/exists/:dni',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  clientController.existByDNI,
);
clientRouter.get(
  '/name/:name',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  clientController.existByName,
);
clientRouter.get('/', isAuthenticated, clientController.findAll);

export default clientRouter;

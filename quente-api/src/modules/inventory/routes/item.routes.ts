import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import itemController from './controllers/item.controller';
import {
  ItemCreateSchema,
  ItemUpdateSchema,
} from './validations/item.schema';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import { idSchema } from '../../../helpers/db/schemas/id.schema';

const itemRouter = express.Router();

itemRouter.post(
  '/bulk',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  itemController.saveAll,
);
itemRouter.post(
  '/',
  validateBody(ItemCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  itemController.save,
);
itemRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(ItemUpdateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.UPDATE)),
  itemController.update,
);
itemRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemController.findOne,
);
itemRouter.get(
  '/code/:code',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemController.existByCode,
);
itemRouter.get(
  '/name/:name',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemController.existByName,
);
itemRouter.get('/', isAuthenticated, itemController.findAll);

export default itemRouter;

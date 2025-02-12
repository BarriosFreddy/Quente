import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import itemCategoryController from './controllers/item-category.controller';

import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
import { CategoryCreateSchema, CategoryUpdateSchema } from './validations/item-category.schema';
const itemCategoryRouter = express.Router();

itemCategoryRouter.post(
  '/',
  validateBody(CategoryCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  itemCategoryController.save,
);
itemCategoryRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(CategoryUpdateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.UPDATE)),
  itemCategoryController.update,
);
itemCategoryRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemCategoryController.findOne,
);
itemCategoryRouter.get(
  '/code/:code',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemCategoryController.existByCode,
);
itemCategoryRouter.get(
  '/name/:name',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  itemCategoryController.existByName,
);
itemCategoryRouter.get('/', isAuthenticated, itemCategoryController.findAll);

export default itemCategoryRouter;

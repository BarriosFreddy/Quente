import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { validateBody } from '../../../helpers/middleware/validation.middleware';

import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import PurchaseOrderController from './controllers/purchase-order.controller';
import { PurchaseOrderCreateSchema } from './validations/purchase-order.schema';
import { container } from 'tsyringe';

const purchaseOrderRouter = express.Router();
const purchaseOrderController = container.resolve(PurchaseOrderController);

purchaseOrderRouter.post(
  '/',
  validateBody(PurchaseOrderCreateSchema),
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  purchaseOrderController.save,
);

purchaseOrderRouter.get(
  '/',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  purchaseOrderController.findAll,
);


export default purchaseOrderRouter;

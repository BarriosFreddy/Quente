import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';
import kardexTransactionsController from './controllers/kardex.controller';
import { validateBody } from '../../../helpers/middleware/validation.middleware';
import { KardexBulkCreateSchema } from './validations/kardex-transaction.schema';

const kardexTransactionRouter = express.Router();

kardexTransactionRouter.post(
  '/bulk',
  isAuthenticated,
  validateBody(KardexBulkCreateSchema),
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  kardexTransactionsController.saveAll,
);
export default kardexTransactionRouter;

import { Router } from 'express';
import {
  createLayawaySchema,
  addPaymentSchema,
  updateLayawayStatusSchema
} from './validations/layaway.schema';
import {
  createLayaway,
  getLayaways,
  getLayawayById,
  addPayment,
  getLayawayPayments,
  updateLayawayStatus
} from './controllers/layaway.controller';
import { validateBody } from '../../../helpers/middleware/validation.middleware';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';
import { ModuleCode } from '../../core/entities/enums/modules-codes';
import { Privilege } from '../../core/entities/enums/privileges';

const router = Router();

// Rutas para los planes separe
router.post('/',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  validateBody(createLayawaySchema), createLayaway);
router.get('/',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  getLayaways);
router.get('/:id',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  getLayawayById);

// Rutas para pagos de planes separe
router.post('/:id/payments',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.CREATE)),
  validateBody(addPaymentSchema), addPayment);
router.get('/:id/payments',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  getLayawayPayments);

// Ruta para actualizar estado
router.patch('/:id/status',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.UPDATE)),
  validateBody(updateLayawayStatusSchema), 
  updateLayawayStatus);

export default router;

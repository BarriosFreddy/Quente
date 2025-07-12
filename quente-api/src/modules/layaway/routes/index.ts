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
} from '../controllers/layaway.controller';
import { validateBody } from '../../../helpers/middleware/validation.middleware';

const router = Router();

// Rutas para los planes separe
router.post('/', validateBody(createLayawaySchema), createLayaway);
router.get('/', getLayaways);
router.get('/:id', getLayawayById);

// Rutas para pagos de planes separe
router.post('/:id/payments', validateBody(addPaymentSchema), addPayment);
router.get('/:id/payments', getLayawayPayments);

// Ruta para actualizar estado
router.patch('/:id/status', validateBody(updateLayawayStatusSchema), updateLayawayStatus);

export default router;

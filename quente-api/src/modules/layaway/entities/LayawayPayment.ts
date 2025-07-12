import { InferSchemaType } from 'mongoose';
import { layawayPaymentSchema } from '../db/schemas/layaway-payment.schema';

export type LayawayPayment = InferSchemaType<typeof layawayPaymentSchema>;

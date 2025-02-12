import { InferSchemaType } from 'mongoose';
import { billingSchema } from '../db/schemas/billing.schema';

export type Billing = InferSchemaType<typeof billingSchema>;

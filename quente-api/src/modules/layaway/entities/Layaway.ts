import { InferSchemaType } from 'mongoose';
import { layawaySchema } from '../db/schemas/layaway.schema';

export type Layaway = InferSchemaType<typeof layawaySchema>;

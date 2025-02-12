import { InferSchemaType } from 'mongoose';
import { userAccountSchema } from '../db/schemas/user-account.schema';

export type UserAccount = InferSchemaType<typeof userAccountSchema>;

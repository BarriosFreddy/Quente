import { InferSchemaType } from "mongoose";
import { moduleSchema } from '../db/schemas/module.schema';

export type Module = InferSchemaType<typeof moduleSchema>
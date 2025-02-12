import { InferSchemaType } from "mongoose";
import { roleSchema } from "../db/schemas/roles.schema";

export type Role = InferSchemaType<typeof roleSchema>
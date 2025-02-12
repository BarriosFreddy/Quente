import { InferSchemaType } from "mongoose";
import { enumerationSchema } from "../db/schemas/enumeration.schema";

export type Enumeration = InferSchemaType<typeof enumerationSchema>
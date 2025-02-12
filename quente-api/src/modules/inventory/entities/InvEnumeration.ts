import { InferSchemaType } from "mongoose";
import { invEnumerationSchema } from "../db/schemas/inv-enumeration.schema";

export type InvEnumeration = InferSchemaType<typeof invEnumerationSchema>
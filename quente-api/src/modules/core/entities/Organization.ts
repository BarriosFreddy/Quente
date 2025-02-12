import { InferSchemaType } from "mongoose";
import { organizationSchema } from "../db/schemas/organization.schema";

export type Organization = InferSchemaType<typeof organizationSchema>
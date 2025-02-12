import { InferSchemaType } from "mongoose";
import { kardexTransactionSchema } from "../db/schemas/kardex-transaction.schema";

export type KardexTransaction = InferSchemaType<typeof kardexTransactionSchema>
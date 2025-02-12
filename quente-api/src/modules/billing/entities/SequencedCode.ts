
import { InferSchemaType } from "mongoose";
import { sequencedCodeSchema } from "../db/schemas/sequenced-code.schema";


export type SequencedCode = InferSchemaType<typeof sequencedCodeSchema>
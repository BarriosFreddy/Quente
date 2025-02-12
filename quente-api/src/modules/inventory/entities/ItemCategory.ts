import { InferSchemaType } from "mongoose";
import { itemCategorySchema } from "../db/schemas/item-category.schema";

export type ItemCategory = InferSchemaType<typeof itemCategorySchema>
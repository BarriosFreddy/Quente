import { Schema } from 'mongoose';

export const itemCategorySchema = new Schema({
  code: String,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,
});

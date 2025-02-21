import { Schema, Types } from 'mongoose';

export const itemCategorySchema = new Schema({
  _id: Types.ObjectId,
  code: String,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,
});

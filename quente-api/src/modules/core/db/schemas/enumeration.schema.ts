import { Schema, Types } from 'mongoose';

export const enumerationSchema = new Schema({
  name: String,
  description: String,
  values: [
    {
      _id: Types.ObjectId,
      label: String,
      code: String,
    },
  ],
  createdAt: Date,
  updatedAt: Date,
});

import { Schema, Types } from 'mongoose';

export const brancOfficeSchema = new Schema({
  organizationId: Types.ObjectId,
  name: String,
  address: String,
  phoneNumber: String,
  country: String,
  city: String,
  createdAt: {
    date: Number,
    offset: Number,
  },
  updatedAt: {
    date: Number,
    offset: Number,
  },
  modifiedBy: Types.ObjectId,
});

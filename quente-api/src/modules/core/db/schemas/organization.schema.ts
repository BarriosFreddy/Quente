import { Schema, Types } from 'mongoose';

export const organizationSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  nit: { type: String, required: true, unique: true },
  address: String,
  city: String,
  country: String,
  phoneNumber: String,
  logoLink: String,
  status: String,
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

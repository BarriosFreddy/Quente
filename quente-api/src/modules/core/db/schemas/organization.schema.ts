import { Schema, Types } from 'mongoose';

export const organizationSchema = new Schema({
  uid: String,
  name: String,
  nit: String,
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

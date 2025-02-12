import { Schema } from 'mongoose';

export const clientSchema = new Schema({
  name: String,
  dni: String,
  dniType: String,
  address: String,
  phoneNumber: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

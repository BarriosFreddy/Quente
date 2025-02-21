import { Schema, Types } from 'mongoose';

export const userAccountSchema = new Schema({
  _id: Types.ObjectId,
  dniType: String,
  dni: String,
  firstName: String,
  lastName: String,
  birthdate: Date,
  codePost: String,
  phone: String,
  address: String,
  email: String,
  password: String,
  roles: [String],
  modifiedBy: Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  organizationId: Types.ObjectId,
  tenantId: String,
  organization: {
    id: Types.ObjectId,
    uid: String,
    name: String,
    tenantId: String,
  },
});

import { Schema, Types } from 'mongoose';

export const moduleSchema = new Schema({
  name: String,
  code: String,
  uri: String,
  icon: String,
  access: [
    {
      roleCode: String,
      canAccess: Boolean,
      canCreate: Boolean,
      canUpdate: Boolean,
      canDelete: Boolean,
      canExecute: Boolean,
    },
  ],
  modifiedBy: Types.ObjectId,
});

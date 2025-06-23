import { Schema, Types } from 'mongoose';

// Status values for billing
export enum BillingStatus {
  APPROVED = 'APPROVED',
  CANCELED = 'CANCELED',
  
}

export const billingSchema = new Schema({
  code: String,
  billAmount: Number,
  receivedAmount: Number,
  paymentMethod: String,
  creationDate: String,
  clientId: Types.ObjectId,
  items: [
    {
      _id: Types.ObjectId,
      code: String,
      name: String,
      description: String,
      price: Number,
      units: Number,
      measurementUnit: String,
      multiplicity: Number,
      lot: String,
      expirationDate: String,
      laboratory: String,
    },
  ],
  modifiedBy: Types.ObjectId,
  client: {
    id: Types.ObjectId,
    name: String,
  },
  createdBy: {
    id: Types.ObjectId,
    name: String,
  },
  seller: {
    id: Types.ObjectId,
    name: String,
  },
  createdAt: {
    date: Number,
    offset: Number,
  },
  // Add updatedAt field for tracking changes
  updatedAt: {
    type: Date,
    default: null,
  },
  // Status field - APPROVED by default
  status: {
    type: String,
    enum: Object.values(BillingStatus),
    default: BillingStatus.APPROVED,
  },
});

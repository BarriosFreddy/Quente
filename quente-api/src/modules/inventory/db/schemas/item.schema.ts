import { Schema, Types } from 'mongoose';

export const itemSchema = new Schema({
  code: String,
  name: String,
  description: String,
  sku: String,
  reorderPoint: Number, // lowest point to alert and reorder it
  laboratory: String,
  pricesRatio: [
    {
      _id: Types.ObjectId,
      measurementUnit: String,
      price: Number,
      cost: Number,
      totalCost: Number,
      quantityPerPackage: Number,
      hash: String,
      main: String,
      multiplicity: Number,
      organizationId: String,
    },
  ],
  expirationControl: [
    {
      id: String,
      _id: Types.ObjectId,
      lot: String,
      expirationDate: String,
      lotUnits: Number,
      organizationId: String,
    },
  ],
  categoryId: Types.ObjectId,
  supplierId: Types.ObjectId,
  modifiedBy: Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

import { Schema, Types } from 'mongoose';

export const kardexTransactionSchema = new Schema({
  _id: Types.ObjectId,
  type: String,
  itemId: Types.ObjectId,
  itemCode: String,
  itemCost: Number,
  itemPrice: Number,
  units: Number,
  computed: { type: Boolean },
  createdBy: Types.ObjectId,
  createdAt: {
    date: Number,
    offset: Number,
  },
});

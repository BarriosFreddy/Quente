import { Schema, Types } from 'mongoose';

export const sequencedCodeSchema = new Schema({
  _id: Types.ObjectId,
  prefixPart1: String,
  prefixPart2: String,
  sequence: Number,
});

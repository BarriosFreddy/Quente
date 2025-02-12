import { Schema } from "mongoose";

export const supplierSchema = new Schema({
    nit: String,
    name: String,
    address: String,
    email: String,
    phoneNumber: String,
    contactName: String,
    createdAt: {
      date: Number,
      offset: Number,
    },
  })
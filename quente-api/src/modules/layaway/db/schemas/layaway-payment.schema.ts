import { Schema, Types } from 'mongoose';

export const layawayPaymentSchema = new Schema({
  layawayId: Types.ObjectId,      // Referencia al plan separe
  amount: Number,                 // Cantidad pagada
  paymentMethod: String,          // Método de pago
  paymentDate: {
    date: Number,
    offset: Number,
  },
  receiptNumber: String,          // Número de recibo
  notes: String,                  // Observaciones
  createdBy: {
    id: Types.ObjectId,
    name: String,
  },
  createdAt: {
    date: Number,
    offset: Number,
  },
});

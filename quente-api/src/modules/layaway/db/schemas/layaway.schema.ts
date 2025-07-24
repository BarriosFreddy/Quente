import { Schema, Types } from 'mongoose';

// Estados para el plan separe
export enum LayawayStatus {
  ACTIVE = 'ACTIVE',          // Plan activo con pagos pendientes
  COMPLETED = 'COMPLETED',    // Plan completamente pagado, pendiente por entregar
  DELIVERED = 'DELIVERED',    // Plan pagado y producto entregado
  CANCELED = 'CANCELED',      // Plan cancelado
}

export const layawaySchema = new Schema({
  code: String,                   // Código único del plan separe
  totalAmount: Number,            // Monto total del plan
  initialPayment: Number,         // Pago inicial
  remainingAmount: Number,        // Monto restante por pagar
  paidAmount: Number,             // Monto total pagado hasta la fecha
  agreementDate: Date,            // Fecha del acuerdo
  expectedDeliveryDate: Date,     // Fecha estimada de entrega
  completionDate: Date,           // Fecha de finalización del plan
  status: {
    type: String,
    enum: Object.values(LayawayStatus),
    default: LayawayStatus.ACTIVE,
  },
  items: [
    {
      _id: Types.ObjectId,
      code: String,
      name: String,
      price: Number,
      units: Number,
    },
  ],
  payments: [Types.ObjectId],     // Referencias a los pagos realizados
  notes: String,                  // Notas o términos específicos
  createdBy: {
    id: Types.ObjectId,
    name: String,
  },
  client: {
    id: Types.ObjectId,
    name: String,
    lastName: String,
    email: String,
    phoneNumber: String,
  },
  createdAt: {
    date: Number,
    offset: Number,
  },
  updatedAt: {
    date: Number,
    offset: Number,
  },
});

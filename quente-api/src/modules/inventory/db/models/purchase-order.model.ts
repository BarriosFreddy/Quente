import mongoose from 'mongoose';
import { purchaseOrderSchema } from '../schemas/purchase-order.schema';
import { PurchaseOrder } from '../../entities/PurchaseOrder';

const PurchaseOrderModel = mongoose.model<PurchaseOrder>('PurchaseOrder', purchaseOrderSchema, 'purchase-orders');
export default PurchaseOrderModel;

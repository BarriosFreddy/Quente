import mongoose from 'mongoose';
import { supplierSchema } from '../schemas/supplier.schema';

const SupplierModel = mongoose.model('Supplier', supplierSchema);
export default SupplierModel;

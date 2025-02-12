import mongoose from 'mongoose';
import { kardexTransactionSchema } from '../schemas/kardex-transaction.schema';

const KardexTransactionModel = mongoose.model(
  'KardexTransactions',
  kardexTransactionSchema,
  'kardex-transactions',
);
export default KardexTransactionModel;

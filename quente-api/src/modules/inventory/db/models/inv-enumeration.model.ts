import mongoose from 'mongoose';
import { InvEnumeration } from '../../entities/InvEnumeration';
import { invEnumerationSchema } from '../schemas/inv-enumeration.schema';

const InvEnumerationModel = mongoose.model<InvEnumeration>(
  'InvEnumeration',
  invEnumerationSchema,
  'inv_enumerations',
);
export default InvEnumerationModel;

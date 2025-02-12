import mongoose from 'mongoose';
import { brancOfficeSchema } from '../schemas/branch-office.schema';

const BranchOfficeModel = mongoose.model('BrancOffice', brancOfficeSchema);
export default BranchOfficeModel;

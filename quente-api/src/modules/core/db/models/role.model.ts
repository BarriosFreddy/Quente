import mongoose from 'mongoose';
import { roleSchema } from '../schemas/roles.schema';

const RoleModel = mongoose.model('Role', roleSchema);
export default RoleModel;

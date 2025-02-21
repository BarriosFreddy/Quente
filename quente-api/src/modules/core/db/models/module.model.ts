import mongoose from 'mongoose';
import { moduleSchema } from '../schemas/module.schema';

const ModuleModel = mongoose.model('Module', moduleSchema);
export default ModuleModel;

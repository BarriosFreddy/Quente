import mongoose from 'mongoose';
import { clientSchema } from '../schemas/client.schema';


const ClientModel = mongoose.model('Client', clientSchema);
export default ClientModel;

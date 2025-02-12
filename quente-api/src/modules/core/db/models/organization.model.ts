import mongoose from 'mongoose';
import { organizationSchema } from '../schemas/organization.schema';

const OrganizationModel = mongoose.model('Organization', organizationSchema);
export default OrganizationModel;

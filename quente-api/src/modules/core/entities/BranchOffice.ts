import { InferSchemaType } from 'mongoose';
import { brancOfficeSchema } from '../db/schemas/branch-office.schema';

export type BranchOffice = InferSchemaType<typeof brancOfficeSchema>;

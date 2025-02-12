import mongoose from 'mongoose';
import { sequencedCodeSchema } from '../schemas/sequenced-code.schema';

const SequencedCodeModel = mongoose.model('SequencedCode', sequencedCodeSchema, 'sequenced-codes')
export default SequencedCodeModel;

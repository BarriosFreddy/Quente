import { singleton } from 'tsyringe';
import { SequencedCode } from '../entities/SequencedCode';
import { sequencedCodeSchema } from './../db/schemas/sequenced-code.schema';
import { BaseService } from '../../../helpers/abstracts/base.service';

@singleton()
export class SequencedCodeService extends BaseService<SequencedCode> {
  getModelName = () => 'SequencedCode';
  getSchema = () => sequencedCodeSchema;
  getCollectionName = () => 'sequenced-codes';

  async findLastOne(): Promise<SequencedCode | null> {
    return await this.getModel()
      .findOne()
      .sort({ sequence: -1 })
      .limit(1)
      .exec();
  }

  async update(
    id: string,
    sequencedCode: SequencedCode,
  ): Promise<SequencedCode | null> {
    try {
      console.log({ id, sequencedCode, model: this.getModel() });

      await this.getModel().updateOne({ _id: id }, sequencedCode);
      return Promise.resolve(null);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  findOne(_id: string): Promise<SequencedCode | null> {
    throw new Error('Not implemented yet');
  }
  findAll(_filter: any): Promise<SequencedCode[]> {
    throw new Error('Not implemented yet');
  }
  save(_role: SequencedCode): Promise<SequencedCode> {
    throw new Error('Not implemented yet');
  }
}

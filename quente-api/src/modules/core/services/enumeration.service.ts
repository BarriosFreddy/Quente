import { BaseService } from '../../../helpers/abstracts/base.service';
import { singleton } from 'tsyringe';
import mongoose from 'mongoose';
import { Enumeration } from '../entities/Enumeration';
import { enumerationSchema } from '../db/schemas/enumeration.schema';

@singleton()
export class EnumerationService extends BaseService<Enumeration> {
  getModelName = () => 'Enumerations';
  getSchema = () => enumerationSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<Enumeration | null> {
    return await this.getModel()
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
      })
      .exec();
  }
  async findAll(): Promise<Enumeration[]> {
    const enumerations = await this.getModel().find().exec();
    return enumerations;
  }
  async save(enumeration: Enumeration): Promise<Enumeration> {
    try {
      enumeration.createdAt = new Date();
      return await this.getModel().create(enumeration);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(
    id: string,
    enumeration: Enumeration,
  ): Promise<Enumeration | null> {
    try {
      enumeration.updatedAt = new Date();
      await this.getModel().updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        enumeration,
      );
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

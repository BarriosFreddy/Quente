import { IRepository } from './IRepository';
import { UpdateWriteOpResult } from 'mongoose';
import { InvEnumeration } from '../../entities/InvEnumeration';
import InvEnumerationModel from '../models/inv-enumeration.model';

export class InvEnumerationRepository implements IRepository<InvEnumeration> {
  public async findAll(query: {
    page: string | number;
  }): Promise<InvEnumeration[]> {
    return await InvEnumerationModel.find({})
      .skip(10 * (+query.page - 1))
      .limit(10);
  }
  public async save(invEnumeration: InvEnumeration): Promise<InvEnumeration> {
    return await InvEnumerationModel.create(invEnumeration);
  }

  public async update(
    id: string,
    invEnumeration: InvEnumeration,
  ): Promise<UpdateWriteOpResult> {
    return await InvEnumerationModel.updateOne({ _id: id }, invEnumeration);
  }

  public async findOne(id: string): Promise<InvEnumeration | null> {
    return await InvEnumerationModel.findOne({ _id: id });
  }
  public async findByCode(code: string): Promise<InvEnumeration | null> {
    return await InvEnumerationModel.findOne({ code });
  }
}

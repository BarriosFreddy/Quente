import { BaseService } from '../../../helpers/abstracts/base.service';
import { brancOfficeSchema } from '../db/schemas/branch-office.schema';
import { BranchOffice } from '../entities/BranchOffice';
import { singleton } from 'tsyringe';

@singleton()
export class BranchOfficeService extends BaseService<BranchOffice> {
  getModelName = () => 'BrancOffice';
  getSchema = () => brancOfficeSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<BranchOffice | null> {
    return await this.getModel().findById(id).exec();
  }
  async findAll(): Promise<BranchOffice[]> {
    const branches = await this.getModel().find().exec();
    return branches;
  }
  async save(branchOffice: BranchOffice): Promise<BranchOffice> {
    try {
      return await this.getModel().create(branchOffice);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async update(
    id: string,
    branchOffice: BranchOffice,
  ): Promise<BranchOffice | null> {
    try {
      await this.getModel().updateOne({ _id: id }, branchOffice);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

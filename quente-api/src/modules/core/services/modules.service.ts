import { BaseService } from '../../../helpers/abstracts/base.service';
import { Module } from '../entities/Module';
import { singleton } from 'tsyringe';
import { moduleSchema } from '../db/schemas/module.schema';

@singleton()
export class ModuleService extends BaseService<Module> {
  getModelName = () => 'Module';
  getSchema = () => moduleSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<Module | null> {
    return await this.getModel().findById(id).exec();
  }
  async findByCode(code: string): Promise<Module | null> {
    return await this.getModel().findOne({ code }).exec();
  }
  async findAll(): Promise<Module[]> {
    const modules = await this.getModel().find().exec();
    return modules;
  }

  async save(modules: Module): Promise<Module> {
    try {
      return await this.getModel().create(modules);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(id: string, modules: Module): Promise<Module | null> {
    try {
      await this.getModel().updateOne({ _id: id }, modules);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

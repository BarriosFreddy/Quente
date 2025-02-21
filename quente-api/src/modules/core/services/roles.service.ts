import { BaseService } from '../../../helpers/abstracts/base.service';
import { Role } from '../entities/Role';
import { singleton } from 'tsyringe';
import { roleSchema } from '../db/schemas/roles.schema';

@singleton()
export class RoleService extends BaseService<Role> {
  getModelName = () => 'Role';
  getSchema = () => roleSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<Role | null> {
    return await this.getModel().findById(id).exec();
  }
  async findAll(): Promise<Role[]> {
    const roles = await this.getModel().find().exec();
    return roles;
  }

  async save(role: Role): Promise<Role> {
    try {
      role.createdAt = new Date();
      return await this.getModel().create(role);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(id: string, role: Role): Promise<Role | null> {
    try {
      role.updatedAt = new Date();
      await this.getModel().updateOne({ _id: id }, role);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

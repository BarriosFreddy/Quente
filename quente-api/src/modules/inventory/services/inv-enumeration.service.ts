import { singleton } from 'tsyringe';
import { InvEnumeration } from '../entities/InvEnumeration';
import { BaseService } from '../../../helpers/abstracts/base.service';
import { invEnumerationSchema } from '../db/schemas/inv-enumeration.schema';

@singleton()
export class InvEnumerationService extends BaseService<InvEnumeration> {
  constructor() {
    super();
  }
  getModelName = () => 'InvEnumeration';
  getSchema = () => invEnumerationSchema;
  getCollectionName = () => 'inv_enumerations';

  async save(invEnumeration: InvEnumeration): Promise<InvEnumeration> {
    try {
      return this.getModel().create(invEnumeration);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(
    id: string,
    invEnumeration: InvEnumeration,
  ): Promise<InvEnumeration | null> {
    try {
      await this.getModel().update(id, invEnumeration);
      return this.getModel().findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  findAll(query: { page: string | number }): Promise<InvEnumeration[]> {
    try {
      return this.getModel().find(query);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  findByCode(code: string): Promise<InvEnumeration | null> {
    try {
      return this.getModel().findOne({ code });
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  findOne(_id: string): Promise<InvEnumeration | null> {
    return Promise.resolve(null);
  }
}

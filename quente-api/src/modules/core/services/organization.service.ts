import { BaseService } from '../../../helpers/abstracts/base.service';
import { Organization } from '../entities/Organization';
import { autoInjectable, singleton } from 'tsyringe';
import { organizationSchema } from '../db/schemas/organization.schema';
import { OrganizationStatus } from '../entities/enums/organization-status';
import { OrganizationDeployService } from './organization-deploy.service';
import { nextTick } from 'process';

@singleton()
@autoInjectable()
export class OrganizationService extends BaseService<Organization> {
  constructor(private organizationDeployService: OrganizationDeployService) {
    super();
  }

  getModelName = () => 'Organization';
  getSchema = () => organizationSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<Organization | null> {
    return await this.getModel().findById(id).exec();
  }
  async findAll(): Promise<Organization[]> {
    const organizations = await this.getModel().find().exec();
    return organizations;
  }
  async save(organization: Organization): Promise<Organization> {
    try {
      organization.status = OrganizationStatus.CREATING;
      const organizationSaved = await this.getModel().create(organization);
      nextTick(async () => {
        if (organizationSaved)
          await this.organizationDeployService.init(organizationSaved);
      });
      return organizationSaved;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async update(
    id: string,
    organization: Organization,
  ): Promise<Organization | null> {
    try {
      await this.getModel().updateOne({ _id: id }, organization);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

import { BaseService } from '../../../helpers/abstracts/base.service';
import { Organization } from '../entities/Organization';
import { autoInjectable, singleton, container } from 'tsyringe';
import { organizationSchema } from '../db/schemas/organization.schema';
import { OrganizationStatus } from '../entities/enums/organization-status';
import { OrganizationDeployService } from './organization-deploy.service';
import { nextTick } from 'process';
import mongoose from 'mongoose';
import { MongoDBService } from '../../../helpers/db/mongodb.service';

@singleton()
@autoInjectable()
export class OrganizationService extends BaseService<Organization> {
  constructor(private organizationDeployService: OrganizationDeployService) {
    super();
  }

  getModelName = () => 'Organization';
  getSchema = () => organizationSchema;
  getCollectionName = () => 'organizations';

  // Override getConnection to use quente_admin database specifically for organizations
  protected getConnection() {
    mongoose.set('debug', true);
    return container.resolve(MongoDBService).getConnection('quente_admin');
  }

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

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.getModel().deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.log(error);
      return Promise.reject(false);
    }
  }

  async deploy(id: string): Promise<boolean> {
    try {
      // Find organization by id
      const organization = await this.getModel().findById(id).exec();

      if (!organization) {
        console.log(`Organization with id ${id} not found`);
        return false;
      }

      // Only deploy if organization is in CREATING status
      if (organization.status !== OrganizationStatus.CREATING) {
        console.log(`Organization with id ${id} is not in CREATING status`);
        return false;
      }

      // Set the organization service in the deploy service
      this.organizationDeployService.setOrganizationService(this);

      // Initiate deployment process
      const result = await this.organizationDeployService.init(organization);
      return result;
    } catch (error) {
      console.log(`Error deploying organization: ${error}`);
      return Promise.reject(false);
    }
  }
}

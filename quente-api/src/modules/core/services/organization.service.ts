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
      // Check if an organization with the same name already exists
      const existingOrg = await this.getModel()
        .findOne({ name: organization.name })
        .exec();
      if (existingOrg) {
        return Promise.reject({
          message: `An organization with the name '${organization.name}' already exists.`,
          code: 'DUPLICATE_NAME',
        });
      }

      // Set status to CREATING for new organizations
      organization.status = OrganizationStatus.CREATING;

      // Generate a uid based on the organization name (if not already provided)
      if (!organization.uid) {
        // Generate a slug-like uid from the name (lowercase, no spaces, alphanumeric only)
        const uidBaseOnName = organization.name
          ?.toLowerCase()
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/[^a-z0-9_]/g, '') // Remove non-alphanumeric characters
          .substring(0, 20); // Limit length

        // Add a timestamp to ensure uniqueness
        organization.uid = `quente_${uidBaseOnName}_${Date.now()
          .toString()
          .substring(7)}`;
      }

      const organizationSaved = await this.getModel().create(organization);

      // Initialize the organization in a separate tick to avoid blocking
      nextTick(async () => {
        if (organizationSaved)
          await this.organizationDeployService.init(organizationSaved);
      });

      return organizationSaved;
    } catch (error) {
      console.log(error);
      // Check if this is a MongoDB duplicate key error (E11000)
      if (error.name === 'MongoServerError' && error.code === 11000) {
        return Promise.reject({
          message:
            'An organization with the same name or identifier already exists.',
          code: 'DUPLICATE_KEY',
        });
      }
      return Promise.reject(error);
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

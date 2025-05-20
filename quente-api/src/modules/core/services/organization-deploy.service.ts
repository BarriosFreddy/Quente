import { autoInjectable, container, singleton, inject } from 'tsyringe';
import { Logger } from '../../../helpers/logger/logger.service';
import { OrganizationStatus } from '../entities/enums/organization-status';
import { Organization } from '../entities/Organization';
import { MongoDBService } from '../../../helpers/db/mongodb.service';
import { UserAccountService } from './user-account.service';
const { AUTH_DATABASE = '' } = process.env;

@singleton()
@autoInjectable()
export class OrganizationDeployService {
  private organizationService: any;
  private logger: Logger;

  constructor(
    private userAccountService: UserAccountService,
    @inject(Logger) logger: Logger,
  ) {
    this.logger = logger;
  }

  /**
   * Set the organization service - used to update organization status
   */
  public setOrganizationService(service: any): void {
    this.organizationService = service;
  }

  /**
   * Deploy a new organization by creating necessary collections, indexes and initial data
   * @param organization Organization to deploy
   * @returns Promise<boolean> Success status
   */
  public async init(organization: Organization): Promise<boolean> {
    if (!organization.uid) {
      this.logger.error(
        `Cannot deploy organization without uid: ${JSON.stringify(
          organization,
          null,
          2,
        )}`,
      );
      return false;
    }

    // Update organization status to in-progress
    try {
      await this.updateOrganizationStatus(
        organization._id?.toString(),
        OrganizationStatus.CREATING,
      );
      this.logger.info(
        `Starting deployment for organization: ${organization.name} (${organization.uid})`,
      );

      const connection = container
        .resolve(MongoDBService)
        .getConnection(organization.uid);

      // Create collections and indexes
      const collections = await this.createCollectionsAndIndexes(
        connection,
        organization,
      );
      if (!collections) return false;

      // Create initial data
      const initialData = await this.createInitialData(
        connection,
        organization,
      );
      if (!initialData) return false;

      // Create admin user
      const adminUser = await this.createAdminUser(organization);
      if (!adminUser) return false;

      // Set organization status to active
      await this.updateOrganizationStatus(
        organization._id?.toString(),
        OrganizationStatus.ACTIVE,
      );

      this.logger.info(
        `Successfully deployed organization: ${organization.name} (${organization.uid})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error deploying organization ${organization.uid}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      // Set organization status to error
      await this.updateOrganizationStatus(
        organization._id?.toString(),
        OrganizationStatus.INACTIVE,
      );

      return false;
    }
  }

  /**
   * Create all required collections and indexes for the organization
   */
  private async createCollectionsAndIndexes(
    connection: any,
    organization: Organization,
  ): Promise<boolean> {
    try {
      this.logger.info(
        `Creating collections and indexes for ${organization.uid}`,
      );

      const itemsCollection = connection.collection('items');
      const rolesCollection = connection.collection('roles');
      const sequenceCodesCollection = connection.collection('sequenced-codes');
      const modulesCollection = connection.collection('modules');
      const invEnumerationsCollection =
        connection.collection('inv_enumerations');
      const clientsCollection = connection.collection('clients');

      // Create indexes for faster queries
      await itemsCollection.createIndex(
        { code: 1, name: 1 },
        { name: 'code_name_idx', unique: true },
      );

      await itemsCollection.createIndex(
        { 'createdAt.date': -1 },
        { name: 'created_at_date_idx' },
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error creating collections and indexes: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Create initial data for the organization
   */
  private async createInitialData(
    connection: any,
    organization: Organization,
  ): Promise<boolean> {
    try {
      this.logger.info(`Creating initial data for ${organization.uid}`);

      const rolesCollection = connection.collection('roles');
      const sequenceCodesCollection = connection.collection('sequenced-codes');
      const modulesCollection = connection.collection('modules');
      const invEnumerationsCollection =
        connection.collection('inv_enumerations');
      const clientsCollection = connection.collection('clients');

      // Insert roles
      await rolesCollection.insertMany([{ name: 'ADMIN' }, { name: 'SELLER' }]);

      // Insert sequence codes
      await sequenceCodesCollection.insertOne({
        prefixPart1: 'RV',
        prefixPart2: '230000000',
        sequence: 0,
      });

      // Insert enumeration values
      await invEnumerationsCollection.insertOne({
        name: 'Unidades de medida',
        description: 'Unidades de medida',
        values: [
          {
            label: 'CAJA',
            code: 'CAJA',
          },
          {
            label: 'PAQUETE',
            code: 'PAQUETE',
          },
          {
            label: 'UNIDAD',
            code: 'UNIDAD',
          },
        ],
        code: 'UDM',
      });

      // Insert modules
      await modulesCollection.insertMany([
        {
          name: 'Facturación',
          uri: '/billing',
          icon: 'billing',
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date().toLocaleDateString(),
          code: 'BILLING',
          access: [
            {
              roleCode: 'ADMIN',
              canAccess: true,
              canCreate: true,
              canUpdate: true,
              canDelete: true,
              canExecute: true,
            },
            {
              roleCode: 'SELLER',
              canAccess: true,
              canCreate: true,
              canUpdate: false,
              canDelete: false,
              canExecute: false,
            },
          ],
        },
        {
          name: 'Cuenta de usuario',
          code: 'USER_ACCOUNT',
          uri: '/user-account',
          icon: 'user-account',
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date().toLocaleDateString(),
          access: [
            {
              roleCode: 'ADMIN',
              canAccess: true,
              canCreate: true,
              canUpdate: true,
              canDelete: true,
              canExecute: true,
            },
          ],
        },
        {
          name: 'Tablero',
          code: 'DASHBOARD',
          uri: '/dashboard',
          icon: 'dashboard',
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date().toLocaleDateString(),
          access: [
            {
              roleCode: 'ADMIN',
              canAccess: true,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canExecute: false,
            },
            {
              roleCode: 'SELLER',
              canAccess: true,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canExecute: false,
            },
          ],
        },
      ]);

      // Insert default client
      await clientsCollection.insertOne({
        name: 'CLIENTE FINAL',
        dni: '1111111111',
        dniType: 'CC',
        createdAt: {
          date: Date.now(),
          offset: new Date().getTimezoneOffset(),
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error creating initial data: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Create admin user for the organization
   */
  private async createAdminUser(organization: Organization): Promise<boolean> {
    try {
      this.logger.info(`Creating admin user for ${organization.uid}`);

      this.userAccountService.setTenantId = AUTH_DATABASE;

      const adminUser = {
        dniType: 'CC',
        dni: '1111111111',
        firstName: 'SUPER-ADMIN',
        lastName: 'SUPER-ADMIN',
        email: `admin@${organization.uid}.com`,
        password: 'fbarrios',
        roles: ['ADMIN', 'SELLER'],
        organization: {
          name: organization.name,
          tenantId: organization.uid,
        },
      };

      await this.userAccountService.save(adminUser);
      return true;
    } catch (error) {
      this.logger.error(
        `Error creating admin user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Update organization status
   */
  private async updateOrganizationStatus(
    id: string | undefined,
    status: OrganizationStatus,
  ): Promise<void> {
    if (!id || !this.organizationService) return;

    try {
      this.logger.info(`Updating organization ${id} status to ${status}`);
      await this.organizationService.update(id, { status } as Organization);
    } catch (error) {
      this.logger.error(
        `Error updating organization status: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Deploy a new organization or retry a failed deployment
   */
  public async deployOrganization(organizationId: string): Promise<boolean> {
    if (!this.organizationService) {
      this.logger.error(`OrganizationService not available for deployment`);
      return false;
    }

    try {
      const organization = await this.organizationService.findOne(
        organizationId,
      );
      if (!organization) {
        this.logger.error(`Organization not found with id: ${organizationId}`);
        return false;
      }

      return this.init(organization);
    } catch (error) {
      this.logger.error(
        `Error in deployOrganization: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }
}

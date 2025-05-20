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

    // Get MongoDB connections
    const mongoDBService = container.resolve(MongoDBService);
    const adminConnection = mongoDBService.getConnection('quente_admin');
    const orgConnection = mongoDBService.getConnection(organization.uid);

    // Start a MongoDB session for the transaction
    const session = await adminConnection.startSession();

    // Update organization status to in-progress
    try {
      // Start a transaction
      session.startTransaction();

      this.logger.info(
        `Starting deployment for organization: ${organization.name} (${organization.uid})`,
      );

      // Update status to CREATING - part of the transaction
      await this.updateOrganizationStatus(
        this.getOrganizationId(organization),
        OrganizationStatus.CREATING,
        session,
      );

      // Create collections and indexes
      const collections = await this.createCollectionsAndIndexes(
        orgConnection,
        organization,
        session,
      );
      if (!collections) {
        await session.abortTransaction();
        return false;
      }

      // Create initial data
      const initialData = await this.createInitialData(
        orgConnection,
        organization,
        session,
      );
      if (!initialData) {
        await session.abortTransaction();
        return false;
      }

      // Create admin user
      const adminUser = await this.createAdminUser(organization, session);
      if (!adminUser) {
        await session.abortTransaction();
        return false;
      }

      // Set organization status to active
      await this.updateOrganizationStatus(
        this.getOrganizationId(organization),
        OrganizationStatus.ACTIVE,
        session,
      );

      // Commit the transaction
      await session.commitTransaction();

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

      // Abort the transaction on error
      await session.abortTransaction();

      // Set organization status to error
      try {
        await this.updateOrganizationStatus(
          this.getOrganizationId(organization),
          OrganizationStatus.INACTIVE,
        );
      } catch (statusError) {
        this.logger.error(
          `Failed to update organization status after failed deployment: ${
            statusError instanceof Error
              ? statusError.message
              : String(statusError)
          }`,
        );
      }

      return false;
    } finally {
      // End the session regardless of outcome
      await session.endSession();
    }
  }

  /**
   * Create all required collections and indexes for the organization
   */
  private async createCollectionsAndIndexes(
    connection: any,
    organization: Organization,
    session?: any,
  ): Promise<boolean> {
    try {
      this.logger.info(
        `Creating collections and indexes for ${organization.uid}`,
      );

      // Pass session to collection operations where supported
      const itemsCollection = connection.collection('items');
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
    session?: any,
  ): Promise<boolean> {
    try {
      this.logger.info(`Creating initial data for ${organization.uid}`);

      // Get collection references
      const rolesCollection = connection.collection('roles');
      const sequenceCodesCollection = connection.collection('sequenced-codes');
      const modulesCollection = connection.collection('modules');
      const invEnumerationsCollection =
        connection.collection('inv_enumerations');
      const clientsCollection = connection.collection('clients');

      // Create session options object if session is provided
      const options = session ? { session } : {};

      // Insert roles with session if provided
      await rolesCollection.insertMany(
        [{ name: 'ADMIN' }, { name: 'SELLER' }],
        options,
      );

      // Insert sequence codes with session if provided
      await sequenceCodesCollection.insertOne(
        {
          prefixPart1: 'RV',
          prefixPart2: '20000000',
          sequence: 0,
        },
        options,
      );

      // Insert enumeration values
      await invEnumerationsCollection.insertOne(
        {
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
        },
        options,
      );

      // Insert modules
      await modulesCollection.insertMany(
        [
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
        ],
        options,
      );

      // Insert default client
      await clientsCollection.insertOne(
        {
          name: 'ANONIMO',
          dni: '1111111111',
          dniType: 'CC',
          createdAt: {
            date: Date.now(),
            offset: new Date().getTimezoneOffset(),
          },
        },
        options,
      );

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
  private async createAdminUser(
    organization: Organization,
    session?: any,
  ): Promise<boolean> {
    try {
      this.logger.info(`Creating admin user for ${organization.uid}`);

      // Set the tenant ID for the user account service
      this.userAccountService.setTenantId = AUTH_DATABASE;

      // Use session in user account operations if provided

      const adminUser = {
        dniType: 'CC',
        dni: '1111111111',
        firstName: 'SUPER-ADMIN',
        lastName: 'SUPER-ADMIN',
        email: `admin@${organization.uid}.com`,
        password: '',
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
   * Gets the organization ID in string format
   * @param organization Organization object
   * @returns string representation of organization ID
   */
  private getOrganizationId(organization: Organization): string {
    // Handle different formats of organization ID
    if (organization.id) {
      return organization.id;
    } else if (organization['_id']) {
      return organization['_id'].toString();
    } else if (organization._id instanceof Types.ObjectId) {
      return organization._id.toString();
    }
    throw new Error('Organization ID not found');
  }

  /**
   * Updates the status of an organization
   * @param id Organization ID
   * @param status New organization status
   * @param session MongoDB session for transactions
   * @returns boolean indicating success
   */
  private async updateOrganizationStatus(
    id: string,
    status: OrganizationStatus,
    session?: any,
  ): Promise<boolean> {
    try {
      if (!id || !this.organizationService) return false;
      this.logger.info(`Updating organization status to ${status}: ${id}`);
      await this.organizationService.update(
        id,
        <Organization>{
          status,
        },
        session,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error updating organization status: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
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

import { autoInjectable, container, singleton } from 'tsyringe';
import { Organization } from '../entities/Organization';
import { MongoDBService } from '../../../helpers/db/mongodb.service';
import { UserAccountService } from './user-account.service';
const { AUTH_DATABASE = '' } = process.env;

@singleton()
@autoInjectable()
export class OrganizationDeployService {
  constructor(private userAccountService: UserAccountService) {}

  public async init(organization: Organization) {
    if (!organization.uid) return;
    const connection = container
      .resolve(MongoDBService)
      .getConnection(organization.uid);
    const itemsCollection = connection.collection('items');
    const rolesCollection = connection.collection('roles');
    const sequenceCodesCollection = connection.collection('sequenced-codes');
    const modulesCollection = connection.collection('modules');
    const invEnumerationsCollection = connection.collection('inv_enumerations');
    const clientsCollection = connection.collection('clients');
    itemsCollection.createIndex(
      { code: 1, name: 1 },
      { name: 'code_name_idx', unique: true },
    );
    itemsCollection.createIndex(
      { 'createdAt.date': -1 },
      { name: 'created_at_date_idx' },
    );

    rolesCollection.insertMany([
      {
        name: 'ADMIN',
      },
      {
        name: 'SELLER',
      },
    ]);

    sequenceCodesCollection.insertOne({
      prefixPart1: 'RV',
      prefixPart2: '230000000',
      sequence: 0,
    });
    invEnumerationsCollection.insertOne({
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

    modulesCollection.insertMany([
      {
        name: 'Facturación',
        uri: '/billing',
        icon: 'billing',
        createdAt: '15/01/2023',
        updatedAt: '15/01/2023',
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
    ]);
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
    this.userAccountService.save(adminUser);

    clientsCollection.insertOne({
      name: 'CLIENTE FINAL',
      dni: '1111111111',
      dniType: 'CC',
    });
  }
}

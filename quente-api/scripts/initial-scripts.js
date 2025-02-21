db.items.createIndex(
  { code: 1, name: 1 },
  { name: 'code_name_idx', unique: true },
);
db.items.createIndex({ 'createdAt.date': -1 }, { name: 'created_at_date_idx' });

// user accounts
db.getCollection('user-accounts').insertMany([
  {
    createdAt: {
      $date: {
        $numberLong: '1684283492498',
      },
    },
    dniType: 'CC',
    dni: '1111111111',
    firstName: 'VENDEDOR',
    lastName: 'VENDEDOR',
    birthdate: {
      $date: {
        $numberLong: '18000000',
      },
    },
    email: 'vendedor@nuapp.com',
    password: '$2a$10$cGDyCML/7Wjg6rVlxX/K1OkhnxwYr4Cc./JMJwx0NWhA/1eSCqjC6',
    roles: ['SELLER'],
    updatedAt: {
      $date: {
        $numberLong: '1684283492498',
      },
    },
    tenantId: 'multidrogas'
  },
  {
    createdAt: {
      $date: {
        $numberLong: '1674013548795',
      },
    },
    dniType: 'CC',
    dni: '124352345',
    firstName: 'ADMIN',
    lastName: 'ADMIN',
    birthdate: {
      $date: {
        $numberLong: '18000000',
      },
    },
    email: 'admin@nuapp.com',
    password: '$2a$10$GC1gYnKqRduW0YfYqIGysu8hMuocB7A0/dARX/mycz0hAVurED30y',
    roles: ['ADMIN', 'SELLER'],
    updatedAt: {
      $date: {
        $numberLong: '1674013548795',
      },
    },
    tenantId: 'multidrogas'
  },
]);

db.enumerations.insertMany([
  {
    createdAt: {
      $date: {
        $numberLong: '1683120056733',
      },
    },
    name: 'Documento de identidad',
    description: 'Documento de identidad',
    values: [
      {
        label: 'Cedúla de ciudadania',
        code: 'CC',
      },
      {
        label: 'Registro civil',
        code: 'RC',
      },
      {
        label: 'Tarjeta de identidad',
        code: 'TI',
      },
      {
        label: 'Pasaporte',
        code: 'P',
      },
    ],
    updatedAt: {
      $date: {
        $numberLong: '1683120056733',
      },
    },
  },
]);

db.roles.insertMany([
  {
    name: 'ADMIN',
  },
  {
    name: 'SELLER',
  },
]);

db.getCollection('sequenced-codes').insertOne({
  prefixPart1: 'RV',
  prefixPart2: '230000000',
  sequence: 0,
});

db.modules.insertMany([
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

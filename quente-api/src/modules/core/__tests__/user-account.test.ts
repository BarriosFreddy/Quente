import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import userAccountRouter from '../routes/user-account.routes';
import cookieParser from 'cookie-parser';
const { SECRET_KEY } = process.env;

jest.mock('../services/user-account.service');
jest.mock('../services/modules.service');
jest.mock('tsyringe', () => ({
  singleton: () => (target: any) => target,
  container: {
    resolve: jest.fn((token) => {
      const mockUserAccount = { id: 1, name: 'Pablo Puello' };
      const savedUserAccount = {
        id: 2,
        dniType: 'CC',
        dni: '11111111',
        firstName: 'Marcela',
        lastName: 'Morelos',
        email: 'marcelamorelos@domain.com',
        password: 'pass',
        roles: ['SELLER'],
      };

      const mockUserAccountService = {
        findAll: jest.fn().mockReturnValue([mockUserAccount]),
        findOne: jest.fn().mockReturnValue(mockUserAccount),
        save: jest.fn().mockReturnValue(savedUserAccount),
        update: jest
          .fn()
          .mockReturnValue({ ...savedUserAccount, firstName: 'Marcela M' }),
      };
      const mockModuleService = {
        findByCode: jest.fn().mockReturnValue({
          code: 'USER_ACCOUNT',
          access: [
            {
              roleCode: 'ADMIN',
              canAccess: true,
              canUpdate: true,
            },
          ],
        }),
      };

      if (token.name === 'UserAccountService') return mockUserAccountService;
      if (token.name === 'ModuleService') return mockModuleService;
      return;
    }),
    registerSingleton: jest.fn(),
  },
}));
const mockUserAccounts = [{ id: 1, name: 'Pablo Puello' }];

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/user-accounts', userAccountRouter);

const generateTestToken = () => {
  const payload = {
    data: {
      id: 1,
      name: 'Pablo Puello',
      roles: ['ADMIN', 'SELLER'],
      organization: {},
    },
    type: 'access'
  };
  const secret = SECRET_KEY as string;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

describe('UserAccountsController Integration Tests', () => {
  let token: string;

  beforeAll(() => {
    token = generateTestToken();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all user accounts', async () => {
    const response = await request(app)
      .get('/user-accounts')
      .set('Cookie', [`access_token=${token}`]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserAccounts);
  });

  it('should return a single user account', async () => {
    const mockUserAccount = { id: 1, name: 'Pablo Puello' };
    const response = await request(app)
      .get('/user-accounts/1')
      .set('Cookie', [`access_token=${token}`]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserAccount);
  });

  it('should save a new user account', async () => {
    const newUserAccount = {
      dniType: 'CC',
      dni: '11111111',
      firstName: 'Marcela',
      lastName: 'Morelos',
      email: 'marcelamorelos@domain.com',
      password: 'pass',
      roles: ['SELLER'],
    };
    const savedUserAccount = { id: 2, ...newUserAccount };

    const response = await request(app)
      .post('/user-accounts')
      .set('Cookie', [`access_token=${token}`])
      .send(newUserAccount);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedUserAccount);
  });

  it('should update an existing user account', async () => {
    const updatingUserAccount = { firstName: 'Marcela M' };
    const updatedUserAccount = {
      id: 2,
      dniType: 'CC',
      dni: '11111111',
      firstName: 'Marcela M',
      lastName: 'Morelos',
      email: 'marcelamorelos@domain.com',
      password: 'pass',
      roles: ['SELLER'],
    };

    const response = await request(app)
      .put('/user-accounts/1')
      .set('Cookie', [`access_token=${token}`])
      .send(updatingUserAccount);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedUserAccount);
  });
});

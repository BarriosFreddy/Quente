import mongoose from 'mongoose';
import { MongoDBService } from './mongodb.service';
import { Connection } from 'mongoose';

jest.mock('mongoose', () => ({
  createConnection: jest.fn().mockReturnValue({
    close: jest.fn(),
    asPromise: jest.fn(),
    destroy: jest.fn(),
    collection: jest.fn(),
    collections: {},
    models: {},
    model: jest.fn(),
  }),
}));

describe('MongoDBService', () => {
  let mongoDBService: MongoDBService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URI = 'mongodb://localhost:27017/DATABASE_NAME';
    process.env.DATABASE_NAME_DEFAULT = 'DATABASE_NAME';
    mongoDBService = new MongoDBService();
  });

  test('should create a new connection if not already exists', async () => {
    const dbName = 'testDB';
    const connection = await mongoDBService.getConnection(dbName);
    expect(mongoose.createConnection).toHaveBeenCalledWith(
      'mongodb://localhost:27017/testDB',
    );
    expect(connection).toBeDefined();
  });
  test('should throw an error if mongoose connection fails', async () => {
    (mongoose.createConnection as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });
    await expect(mongoDBService.getConnection('errorDB')).rejects.toThrow(
      'Database connection failed',
    );
  });

  test('should return existing connection if already created', async () => {
    const dbName = 'existingDB';
    const firstConnection = await mongoDBService.getConnection(dbName);
    const secondConnection = await mongoDBService.getConnection(dbName);

    expect(mongoose.createConnection).toHaveBeenCalledTimes(1);
    expect(firstConnection).toBe(secondConnection);
  });

  test('should return undefined if database name is missing', async () => {
    const connection = await mongoDBService.getConnection('');
    expect(connection).toBeUndefined();
  });

  test('should close connection when closeConnection is called', async () => {
    const dbName = 'testDB';
    const mockClose = jest.fn();
    mongoDBService['tenantConnectionsPool'][dbName] = {
      close: mockClose,
      asPromise: jest.fn(),
      destroy: jest.fn(),
      collection: jest.fn(),
      collections: {},
      models: {},
      model: jest.fn(),
    } as unknown as Connection;

    await mongoDBService.closeConnection(dbName);
    expect(mockClose).toHaveBeenCalled();
    expect(mongoDBService['tenantConnectionsPool'][dbName]).toBeUndefined();
  });

  test('should not attempt to close a non-existent connection', async () => {
    const dbName = 'nonExistentDB';
    await expect(mongoDBService.closeConnection(dbName)).resolves.not.toThrow();
  });
});

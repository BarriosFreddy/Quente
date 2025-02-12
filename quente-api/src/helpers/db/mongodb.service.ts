import 'reflect-metadata';
import mongoose, { Connection } from 'mongoose';
import { singleton } from 'tsyringe';

const { DATABASE_URI, DATABASE_NAME_DEFAULT } = process.env;

@singleton()
export class MongoDBService {
  private tenantConnectionsPool: Record<string, Connection> = {};

  getConnection(dbName: string): Connection {
    if (!this.tenantConnectionsPool[dbName]) {
      try {
        this.tenantConnectionsPool[dbName] = this.connectionFactory(dbName);
      } catch (error) {
        console.error(`Error creating connection for ${dbName}:`, error);
        throw new Error('Database connection failed');
      }
    }

    return this.tenantConnectionsPool[dbName];
  }

  private connectionFactory(tenantId: string): Connection {
    if (!DATABASE_URI || !DATABASE_NAME_DEFAULT)
      throw new Error('Invalid database URI.');
    const uri = DATABASE_URI.replace(DATABASE_NAME_DEFAULT, tenantId);
    if (!uri) throw new Error('Invalid database URI.');

    console.log(`Connecting to MongoDB: ${uri}`);

    try {
      return mongoose.createConnection(uri);
    } catch (error) {
      console.error(
        `Failed to connect to MongoDB for tenant ${tenantId}:`,
        error,
      );
      throw error;
    }
  }

  async closeConnection(dbName: string): Promise<void> {
    if (this.tenantConnectionsPool[dbName]) {
      await this.tenantConnectionsPool[dbName].close();
      delete this.tenantConnectionsPool[dbName];
      console.log(`Closed connection for ${dbName}`);
    }
  }
}

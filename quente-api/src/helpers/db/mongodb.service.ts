import mongoose from 'mongoose';
import { singleton } from 'tsyringe';
const { DATABASE_URI, DATABASE_NAME_DEFAULT = '' } = process.env;

@singleton()
export class MongoDBService {
  private tenantConnectionsPool: { [key: string]: any } = {};
  constructor() {}

  getConnection(dbName: string) {
    return this.connectionFactory(dbName);
  }

  private connectionFactory(tenantId: string) {
    if (!this.tenantConnectionsPool[tenantId]) {
      const uri = DATABASE_URI?.replace(DATABASE_NAME_DEFAULT, tenantId) || '';
      const connection = mongoose.createConnection(uri);
      this.tenantConnectionsPool[tenantId] = connection;
      return this.tenantConnectionsPool[tenantId];
    }
    return this.tenantConnectionsPool[tenantId];
  }
}

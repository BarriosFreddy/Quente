import { container } from 'tsyringe';
import { MongoDBService } from '../db/mongodb.service';
import { Schema } from 'mongoose';

export abstract class BaseService<T> {
  protected tenantId: string = '';

  abstract findOne(id: string): Promise<T | null>;
  abstract findAll(filter: any): Promise<T[]>;
  abstract save(role: T): Promise<T>;
  abstract update(id: string, role: T): Promise<T | null>;

  abstract getModelName(): string;
  abstract getSchema(): Schema;
  abstract getCollectionName(): string | undefined;

  set setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  protected getConnection() {
    return container.resolve(MongoDBService).getConnection(this.tenantId);
  }

  protected getModel() {
    let model = this.getConnection().models[this.getModelName()];
    if (!model)
      model = this.getConnection().model(
        this.getModelName(),
        this.getSchema(),
        this.getCollectionName(),
      );
    return model;
  }
}

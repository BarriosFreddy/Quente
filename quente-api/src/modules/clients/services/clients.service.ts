import { BaseService } from '../../../helpers/abstracts/base.service';
import { singleton } from 'tsyringe';
import { ObjectId } from 'mongoose';
import ClientQueryI from '../db/models/client-query.interface';
import { QueryStrategy } from './query-strategy';
import { ClientQueryStrategy } from './clients-query.strategy';
import { Client } from '../entities/Client';
import { clientSchema } from '../db/schemas/client.schema';

@singleton()
export class ClientService extends BaseService<Client> {
  getModelName = () => 'Client';
  getSchema = () => clientSchema;
  getCollectionName = () => 'clients';

  async findOne(id: string | ObjectId): Promise<Client | null> {
    const client = await this.getModel().findById(id).exec();
    return client;
  }
  async findByDNI(dni: string): Promise<Client | null> {
    const client = await this.getModel().findOne({ dni }).exec();
    return client;
  }
  async existByDNI(dni: string): Promise<any | null> {
    return await this.getModel().exists({ dni }).exec();
  }
  async existByName(name: string): Promise<any | null> {
    return await this.getModel().exists({ name }).exec();
  }
  async save(client: Client): Promise<Client> {
    try {
      client.createdAt = new Date();
      return await this.getModel().create(client);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async saveAll(clients: Client[]): Promise<any> {
    try {
      clients.forEach((client) => (client.createdAt = new Date()));
      let clientModels = clients.map((client) => new (this.getModel())(client));
      const result = await this.getModel().bulkSave(clientModels);
      return result;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(id: string, client: Client): Promise<Client | null> {
    try {
      client.updatedAt = new Date();
      await this.getModel().updateOne({ _id: id }, client);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async findAll(clientQuery: ClientQueryI): Promise<Client[]> {
    const strategy: QueryStrategy = new ClientQueryStrategy(clientQuery);
    const clients: Client[] = await this.getModel()
      .aggregate(strategy.buildAggregate())
      .exec();
    return clients;
  }
}

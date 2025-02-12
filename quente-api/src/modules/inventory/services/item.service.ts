import { BaseService } from '../../../helpers/abstracts/base.service';
import { singleton } from 'tsyringe';
import { ObjectId } from 'mongoose';
import ItemQueryI from '../db/models/item-query.interface';
import { QueryStrategy } from './query-strategy';
import { ItemQueryStrategy } from './item-query.strategy';
import { Item } from '../entities/Item';
import { CostPricePipeline } from './cost-price.pipeline';
import { itemSchema } from '../db/schemas/item.schema';

@singleton()
export class ItemService extends BaseService<Item> {
  getModelName = () => 'Item';
  getSchema = () => itemSchema;
  getCollectionName = () => 'items';

  async findOne(id: string | ObjectId): Promise<Item | null> {
    const item = await this.getModel().findById(id).exec();
    return item ? Item.of(item) : null;
  }
  async existByCode(code: string): Promise<any | null> {
    return await this.getModel().exists({ code }).exec();
  }
  async existByName(name: string): Promise<any | null> {
    return await this.getModel().exists({ name }).exec();
  }
  async save(item: Item): Promise<Item> {
    try {
      item.createdAt = new Date();
      return Item.of(await this.getModel().create(item));
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async saveAll(items: Item[]): Promise<any> {
    try {
      items.forEach((item) => (item.createdAt = new Date()));
      let itemModels = items.map((item) => new (this.getModel())(item));
      const result = await this.getModel().bulkSave(itemModels);
      return result;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(id: string, item: Item): Promise<Item | null> {
    try {
      item.updatedAt = new Date();
      await this.getModel().updateOne({ _id: id }, item);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
  async findAll(itemQuery: ItemQueryI): Promise<Item[]> {
    const strategy: QueryStrategy = new ItemQueryStrategy(itemQuery);
    const items: Item[] = await this.getModel()
      .aggregate(strategy.buildAggregate())
      .exec();
    return items;
  }

  async getCostPriceStats() {
    const costPriceStats = await this.getModel()
      .aggregate(CostPricePipeline)
      .exec();
    return costPriceStats;
  }
}

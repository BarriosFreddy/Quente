import { BaseService } from '../../../helpers/abstracts/base.service';
import { singleton, container } from 'tsyringe';
import { ItemService } from './item.service';
import { KardexTransactionType } from '../entities/enums/kardex-transaction-type';
import { KardexTransaction } from '../entities/kardex-transaction';
import { kardexTransactionSchema } from '../db/schemas/kardex-transaction.schema';

const itemService = container.resolve(ItemService);

@singleton()
export class KardexTransactionService extends BaseService<KardexTransaction> {
  getModelName = () => 'KardexTransaction';
  getSchema = () => kardexTransactionSchema;
  getCollectionName = () => 'kardex-transactions';
  async findOne(id: string): Promise<KardexTransaction | null> {
    return await this.getModel().findById(id).exec();
  }
  async findAll(): Promise<KardexTransaction[]> {
    const bills: KardexTransaction[] = await this.getModel().find().exec();
    return bills;
  }
  async save(kardexTransaction: KardexTransaction): Promise<KardexTransaction> {
    try {
      return await this.getModel().create(kardexTransaction);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async saveAll(kardexTransactions: KardexTransaction[]): Promise<any> {
    try {
      let kardexTransactionModels = kardexTransactions.map(
        (kardex) => new (this.getModel())(kardex),
      );
      const result = await this.getModel().bulkSave(kardexTransactionModels);

      setImmediate(async () => {
        await this.applyKardexMovements(kardexTransactions);
      });

      return result;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async applyKardexMovements(kardexTransactions: KardexTransaction[]) {
    try {
      for await (const kardex of kardexTransactions) {
        const { itemId, units, type } = kardex;
        if (!itemId || units === undefined) continue;
        const item = await itemService.findOne(itemId.toString());
        if (!item || units <= 0) continue;
        //if (type === KardexTransactionType.IN) item.addStock(units);
        else if (type === KardexTransactionType.OUT) item.removeStock(units);
        await itemService.update(itemId.toString(), item);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async update(
    id: string,
    kardexTransaction: KardexTransaction,
  ): Promise<KardexTransaction | null> {
    try {
      await this.getModel().updateOne({ _id: id }, kardexTransaction);
      return this.findOne(id);
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }
}

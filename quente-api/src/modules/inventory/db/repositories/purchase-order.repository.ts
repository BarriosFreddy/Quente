import { PurchaseOrder } from '../../entities/PurchaseOrder';
import { IRepository } from './IRepository';
import PurchaseOrderModel from '../models/purchase-order.model';
import { UpdateWriteOpResult } from 'mongoose';

export class PurchaseOrderRepository implements IRepository<PurchaseOrder> {
  public async findAll(query: {
    page: string | number;
  }): Promise<PurchaseOrder[]> {
    return await PurchaseOrderModel.find({})
      .skip(10 * (+query.page - 1))
      .limit(10);
  }
  public async save(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder> {
    return await PurchaseOrderModel.create(purchaseOrder);
  }

  public async update(
    id: string,
    purchaseOrder: PurchaseOrder,
  ): Promise<UpdateWriteOpResult> {
    return await PurchaseOrderModel.updateOne({ _id: id }, purchaseOrder);
  }

  public async findOne(id: string): Promise<PurchaseOrder | null> {
    return await PurchaseOrderModel.findOne({ _id: id });
  }
}

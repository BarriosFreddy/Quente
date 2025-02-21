import { Types } from 'mongoose';
import { DateObject } from '../../../helpers/abstracts/timestamps.abstract';

export class PurchaseOrder {
  constructor(
    public code: string,
    public items: [
      {
        _id: Types.ObjectId;
        code: string;
        name: string;
        units: number;
        measurementUnit: string;
        cost: number;
        stock: number;
      },
    ],
    public supplierId: Types.ObjectId,
    public comments: string,
    public createdAt: DateObject,
  ) {}
}

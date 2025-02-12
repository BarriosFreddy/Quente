import { Types } from 'mongoose';

export class Client {
  constructor(
    public id: Types.ObjectId,
    public name: string,
    public dniType: string,
    public dni: string,
    public email: string,
    public address: number, // lowest point to alert and reorder it
    public phomeNumber: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

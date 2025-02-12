import { Types } from 'mongoose';

class ExpirationControl {
  constructor(
    public lotUnits: number,
    public lot: string,
    public expirationDate: string,
    public organizationId: String,
    public id: String,
    public _id: Types.ObjectId,
  ) {}
}

class PricesRatio {
  constructor(
    public _id: Types.ObjectId,
    public measurementUnit: String,
    public price: Number,
    public cost: Number,
    public hash: String,
    public main: String,
    public multiplicity: Number,
    public organizationId: String,
  ) {}
}

export class Item {
  constructor(
    public id: Types.ObjectId,
    public code: string,
    public name: string,
    public description: string,
    public reorderPoint: number, // lowest point to alert and reorder it
    public laboratory: string,
    public pricesRatio: [PricesRatio],
    public expirationControl: [ExpirationControl],
    public categoryId: Types.ObjectId,
    public supplierId: Types.ObjectId,
    public modifiedBy: Types.ObjectId,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  public addStock(_stock: number): void {
    // TODO implementation
  }

  public removeStock(units: number): void {
    let unitsToRemove = units;
    for (let index = 0; index < this.expirationControl.length; index++) {
      const expControl: ExpirationControl = this.expirationControl[index];
      let { lotUnits } = expControl;
      if (+lotUnits > +unitsToRemove) {
        this.expirationControl[index].lotUnits = +lotUnits - +unitsToRemove;
        break;
      } else if (+lotUnits === +unitsToRemove) {
        this.expirationControl[index].lotUnits = 0;
        break;
      } else if (+lotUnits < +unitsToRemove) {
        unitsToRemove = +unitsToRemove - +lotUnits;
        this.expirationControl[index].lotUnits = 0;
      }
    }
  }

  public static of({
    id,
    code,
    name,
    description,
    reorderPoint,
    laboratory,
    pricesRatio,
    expirationControl,
    categoryId,
    supplierId,
    modifiedBy,
    createdAt,
    updatedAt,
  }: any): Item {
    return new Item(
      id,
      code,
      name,
      description,
      reorderPoint,
      laboratory,
      pricesRatio,
      expirationControl,
      categoryId,
      supplierId,
      modifiedBy,
      createdAt,
      updatedAt,
    );
  }
}

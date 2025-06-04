import { Types } from 'mongoose';

class ExpirationControl {
  constructor(
    public lotUnits: number,
    public lot: string,
    public expirationDate: string,
    public organizationId: string,
    public id: string,
    public _id: Types.ObjectId,
  ) {}
}

class PricesRatio {
  constructor(
    public _id: Types.ObjectId,
    public measurementUnit: string,
    public price: number,
    public cost: number,
    public hash: string,
    public main: string,
    public multiplicity: number,
    public organizationId: string,
    public label?: string, // Added new optional label property
  ) {}
}

export class Item {
  constructor(
    public _id: Types.ObjectId,
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
      const { lotUnits } = expControl;
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
    _id,
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
      _id,
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

export class DateObject {
  constructor(public date: Number, public offset: Number) {}
}

export class TimeStamps {
  constructor(public createdAt: DateObject, public updatedAt: DateObject) {}
}

export class DateObject {
  constructor(public date: number, public offset: number) {}
}

export class TimeStamps {
  constructor(public createdAt: DateObject, public updatedAt: DateObject) {}
}

export interface IRepository<T> {
    save(t: T): Promise<T>;
}
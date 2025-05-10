import db from "../../../shared/services/DatabaseService";

class ItemsRepository {
  #collectionName = "items";

  constructor(db) {
    this.db = db;
  }
  async save(item) {
    return await this.db.save(this.#collectionName, item);
  }
  async update(id, item) {
    return await this.db.update(this.#collectionName, id, item);
  }
  async saveBulk(items) {
    return await this.db.saveBulk(this.#collectionName, items);
  }
  async find({ page = 1, size = 10 }) {
    return this.db.find(this.#collectionName, { page, size });
  }
  async existsByCode(code) {
    return this.db
      .getCollection(this.#collectionName)
      .where("code")
      .equals(code)
      .first();
  }
  async findByNameOrCode({ name, code, page = 1, size = 10 }) {
    return await this.db
      .getCollection(this.#collectionName)
      .where("name")
      .startsWithIgnoreCase(name || "")
      .or("code")
      .equals(code || "")
      .offset((page - 1) * size)
      .limit(size)
      .toArray();
  }

  async deleteById(id) {
    return this.db.delete(this.#collectionName, id);
  }
}

const itemsRepository = new ItemsRepository(db);
export default itemsRepository;

import indexDBService from "../../../shared/services/indexDB.service";

class ItemsRepository {
  #collectionName = "items";

  constructor(indexDBService) {
    this.indexDBService = indexDBService;
  }
  async save(item) {
    return await this.indexDBService.save(this.#collectionName, item);
  }
  async update(id, item) {
    return await this.indexDBService.update(this.#collectionName, id, item);
  }
  async saveBulk(items) {
    return await this.indexDBService.bulk(this.#collectionName, items);
  }
  async find({ page = 1, size = 10 }) {
    return this.indexDBService.find(this.#collectionName, { page, size });
  }
  async existsByCode(code) {
    return this.indexDBService
      .getCollection(this.#collectionName)
      .where("code")
      .equals(code)
      .first();
  }
  async findByNameOrCode({ name, code, page = 1, size = 10 }) {
    return await this.indexDBService
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
    return this.indexDBService.delete(this.#collectionName, id);
  }
}

const itemsRepository = new ItemsRepository(indexDBService);
export default itemsRepository;

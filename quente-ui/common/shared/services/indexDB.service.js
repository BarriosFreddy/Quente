import { quenteDB } from "../db/indexDB";
import { hexoid } from "hexoid";
const OBJECT_ID_LENGTH = 24;

class IndexDBService {
  constructor(database) {
    this.db = database;
  }

  /**
   *
   * @param {string} collection
   * @param {Object[]} entities
   * @returns
   */
  async bulk(collection, entities) {
    return await this.db[collection].bulkPut(entities);
  }

  /**
   *
   * @param {string} collection
   * @param {Object} entity
   * @returns
   */
  async save(collection, entity) {
    const _id = hexoid(OBJECT_ID_LENGTH)();
    entity._id = _id;
    return await this.db[collection].add(entity);
  }

  /**
   *
   * @param {string} collection
   * @param {Object} entity
   * @returns
   */
  async update(collection, id, entityToUpdate) {
    return await this.db[collection].update(id, entityToUpdate);
  }

  /**
   *
   * @param {string} collection
   * @param {Object} options
   * @returns
   */
  async find(collection, { page = 1, size = 10 }) {
    return await this.db[collection]
      .reverse()
      .offset((page - 1) * size)
      .limit(size)
      .toArray();
  }

  /**
   *
   * @param {string} collection
   * @param {string} id
   * @returns
   */
  async delete(collection, id) {
    return await this.db[collection].where("id").equals(id).delete();
  }
  getCollection(collection) {
    return this.db[collection];
  }
}

const indexDBService = new IndexDBService(quenteDB);
export default indexDBService;

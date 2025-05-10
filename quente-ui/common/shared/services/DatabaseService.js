import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid";
import isOnline from "is-online";
import { hexoid } from "hexoid";
const OBJECT_ID_LENGTH = 24;

class QuenteDatabase extends Dexie {
  constructor() {
    super("quente_db");

    // Define tables with their primary keys and indexes
    this.version(1).stores({
      items: "_id, code, name, price, updatedAt, syncStatus",
      billings: "_id, code, creationDate, billAmount, updatedAt, syncStatus",
      syncQueue: "_id, entity, operation, data, createdAt",
    });

    // Define entities
    this.items = this.table("items");
    this.billings = this.table("billings");
    this.syncQueue = this.table("syncQueue");
  }

  // Add to sync queue when offline
  async addToSyncQueue(entity, operation, data) {
    return await this.syncQueue.add({
      _id: uuidv4(),
      entity,
      operation,
      data,
      createdAt: new Date().toISOString(),
    });
  }

  // Process sync queue when online
  async processSyncQueue(apiService) {
    const queue = await this.syncQueue.toArray();
    let processedCount = 0;

    for (const item of queue) {
      try {
        let response;

        switch (item.operation) {
          case "create":
            response = await apiService.post(`/${item.entity}`, item.data);
            break;
          case "update":
            response = await apiService.put(
              `/${item.entity}/${item.data._id}`,
              item.data
            );
            break;
          case "delete":
            response = await apiService.delete(
              `/${item.entity}/${item.data._id}`
            );
            break;
          default:
            break;
        }

        if (response && response.status >= 200 && response.status < 300) {
          // If successful, remove from queue
          await this.syncQueue.delete(item._id);
          processedCount++;

          // Update local record with server data if needed
          if (
            response.data &&
            (item.operation === "create" || item.operation === "update")
          ) {
            const table = this.table(item.entity);
            await table.put({
              ...response.data,
              syncStatus: "synced",
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process sync item: ${item._id}`, error);
      }
    }

    return processedCount;
  }

  async saveBulk(collection, entities) {
    return await this.table(collection).bulkPut(entities);
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
    return await this.table(collection).add(entity);
  }

  /**
   *
   * @param {string} collection
   * @param {Object} entity
   * @returns
   */
  async update(collection, id, entityToUpdate) {
    return await this.table(collection).update(id, entityToUpdate);
  }
  /**
   *
   * @param {string} collection
   * @param {Object} options
   * @returns
   */
  async find(collection, { page = 1, size = 10 }) {
    return await this.table(collection)
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
  /**
   *
   * @param {string} collection
   * @returns
   */
  getCollection(collection) {
    return this.table(collection);
  }

  // CRUD operations for items
  async getItems(filter = {}) {
    let query = this.items;

    // Apply filters if provided
    if (filter.name) {
      query = query.filter((item) =>
        item.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }

    if (filter.code) {
      query = query.filter((item) =>
        item.code.toLowerCase().includes(filter.code.toLowerCase())
      );
    }

    return await query.toArray();
  }

  async getItem(id) {
    return await this.items.get(id);
  }

  async saveItem(item, apiService) {
    const now = new Date().toISOString();
    const isNew = !item._id;
    const isonline = await isOnline();
    // Generate ID if new item
    if (isNew) {
      item._id = uuidv4();
    }
    // Add timestamps and sync status
    const itemToSave = {
      ...item,
      updatedAt: now,
      syncStatus: isonline ? "synced" : "pending",
    };
    // Save locally
    await this.items.put(itemToSave);
    // If online, sync with server
    if (isonline) {
      try {
        const endpoint = isNew ? "/items" : `/items/${item._id}`;
        const method = isNew ? "post" : "put";
        const itemToUpdate = { ...item, _id: undefined };
        console.log({ itemToUpdate });
        const response = await apiService[method](endpoint, itemToUpdate);

        if (response && response.status >= 200 && response.status < 300) {
          // Update with server data
          await this.items.put({
            ...response.data,
            syncStatus: "synced",
          });
          return response.data;
        }
      } catch (error) {
        console.error("Failed to sync item with server:", error);
        // Mark as pending sync
        await this.items.update(item._id, { syncStatus: "pending" });
        // Add to sync queue
        await this.addToSyncQueue("items", isNew ? "create" : "update", item);
      }
    } else {
      // Add to sync queue for later processing
      await this.addToSyncQueue("items", isNew ? "create" : "update", item);
    }

    return itemToSave;
  }

  // CRUD operations for billings
  async getBillings(filter = {}) {
    let query = this.billings;

    // Apply filters if provided
    if (filter.code) {
      query = query.filter((billing) =>
        billing.code.toLowerCase().includes(filter.code.toLowerCase())
      );
    }

    if (filter.date) {
      query = query.filter((billing) =>
        billing.creationDate.includes(filter.date)
      );
    }

    return await query.toArray();
  }

  async getBilling(id) {
    return await this.billings.get(id);
  }

  async saveBilling(billing, apiService) {
    const now = new Date().toISOString();
    const isNew = !billing._id;
    const isonline = await isOnline();

    // Generate ID if new billing
    if (isNew) {
      billing._id = uuidv4();
    }

    // Add timestamps and sync status
    const billingToSave = {
      ...billing,
      updatedAt: now,
      syncStatus: isonline ? "synced" : "pending",
    };

    // Save locally
    await this.billings.put(billingToSave);

    // If online, sync with server
    if (isonline) {
      try {
        const endpoint = isNew ? "/billings" : `/billings/${billing._id}`;
        const method = isNew ? "post" : "put";
        const billingToUpdate = { ...billing, _id: undefined };

        const response = await apiService[method](endpoint, billingToUpdate);

        if (response && response.status >= 200 && response.status < 300) {
          // Update with server data
          await this.billings.put({
            ...response.data,
            syncStatus: "synced",
          });
          return response.data;
        }
      } catch (error) {
        console.error("Failed to sync billing with server:", error);
        // Mark as pending sync
        await this.billings.update(billing._id, { syncStatus: "pending" });
        // Add to sync queue
        await this.addToSyncQueue(
          "billings",
          isNew ? "create" : "update",
          billing
        );
      }
    } else {
      // Add to sync queue for later processing
      await this.addToSyncQueue(
        "billings",
        isNew ? "create" : "update",
        billing
      );
    }

    return billingToSave;
  }

  // Sync data with server
  async syncWithServer(apiService) {
    // Process pending sync queue first
    const processedCount = await this.processSyncQueue(apiService);

    // Then fetch latest data from server
    try {
      // Sync items
      const itemsResponse = await apiService.get("/items");
      if (itemsResponse && itemsResponse.status === 200) {
        const serverItems = itemsResponse.data;

        // Get local items with pending changes
        const pendingItems = await this.items
          .filter((item) => item.syncStatus === "pending")
          .toArray()
          .then((items) =>
            items.reduce((acc, item) => {
              acc[item._id] = item;
              return acc;
            }, {})
          );

        // Update local database with server data, preserving pending changes
        for (const serverItem of serverItems) {
          if (!pendingItems[serverItem._id]) {
            await this.items.put({
              ...serverItem,
              syncStatus: "synced",
            });
          }
        }
      }

      // Sync billings
      const billingsResponse = await apiService.get("/billings");
      if (billingsResponse && billingsResponse.status === 200) {
        const serverBillings = billingsResponse.data;

        // Get local billings with pending changes
        const pendingBillings = await this.billings
          .filter((billing) => billing.syncStatus === "pending")
          .toArray()
          .then((billings) =>
            billings.reduce((acc, billing) => {
              acc[billing._id] = billing;
              return acc;
            }, {})
          );

        // Update local database with server data, preserving pending changes
        for (const serverBilling of serverBillings) {
          if (!pendingBillings[serverBilling._id]) {
            await this.billings.put({
              ...serverBilling,
              syncStatus: "synced",
            });
          }
        }
      }

      return {
        success: true,
        processedCount,
        message: "Sync completed successfully",
      };
    } catch (error) {
      console.error("Failed to sync with server:", error);
      return {
        success: false,
        processedCount,
        message: "Failed to sync with server",
      };
    }
  }
}

const db = new QuenteDatabase();
export default db;

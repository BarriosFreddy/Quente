import db from "../../../shared/services/DatabaseService";
import dayjs from "dayjs";

const TIME_ZONE = -5;

class BillingRepository {
  #collectionName = "billings";

  constructor(db) {
    this.db = db;
  }

  async save(billing) {
    await this.db.save(this.#collectionName, billing);
  }

  async find({ page = 1, size = 10 }) {
    return this.db.find(this.#collectionName, { page, size });
  }

  /**
   *
   * @param {string} date
   * format YYYY-MM-DD
   * @returns
   */
  async findGreaterThanDate(date) {
    const startDate = dayjs(date).startOf("day").utcOffset(TIME_ZONE).valueOf();
    const billings = await this.db
      .getCollection(this.#collectionName)
      .toArray();
    const filteredBillings = billings.filter((billing) => {
      const createdAtTimestamp = billing.createdAt?.date;
      return createdAtTimestamp && createdAtTimestamp >= startDate;
    });
    const salesMap = {};
    filteredBillings.forEach((b) => {
      const createdAt = dayjs(b.createdAt.date + (b.createdAt.offset || 0))
        .utc()
        .format("YYYY-MM-DD");

      if (!salesMap[createdAt]) {
        salesMap[createdAt] = 0;
      }
      salesMap[createdAt] += b.billAmount || 0;
    });
    const dailySales = Object.entries(salesMap)
      .map(([createdAt, billAmount]) => ({
        createdAt,
        billAmount,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);

    return dailySales;
  }
  /**
   *
   * @param {string} date
   * format YYYY-MM-DD
   * @returns
   */
  async findTopSalesItems(date) {
    const startDate = dayjs(date).startOf("day").utcOffset(TIME_ZONE).valueOf();

    const billings = await this.db
      .getCollection(this.#collectionName)
      .toArray();

    const filteredBillings = billings.filter((billing) => {
      const createdAtTimestamp = billing.createdAt?.date;
      return createdAtTimestamp && createdAtTimestamp >= startDate;
    });

    const salesMap = {};

    filteredBillings.forEach((billing) => {
      billing.items?.forEach((item) => {
        if (!salesMap[item.name]) {
          salesMap[item.name] = 0;
        }
        salesMap[item.name] += Number(item.units) || 0;
      });
    });

    const topSales = Object.entries(salesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
    return topSales;
  }

  async deleteById(id) {
    return this.db.delete(this.#collectionName, id);
  }
}

const billingsRepository = new BillingRepository(db);
export default billingsRepository;

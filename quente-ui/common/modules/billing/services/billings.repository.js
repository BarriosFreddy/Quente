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
   * Find billings with filters support for offline mode
   * @param {Object} options - Filter options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.fromDate - Start date (YYYY-MM-DD)
   * @param {string} options.toDate - End date (YYYY-MM-DD)
   * @param {string} options.status - Billing status
   * @param {number} options.minAmount - Minimum amount
   * @param {number} options.maxAmount - Maximum amount
   * @param {string} options.code - Billing code (partial match)
   * @returns {Promise<Object>} - Filtered billings with pagination info
   */
  async findWithFilters({
    page = 1,
    limit = 10,
    fromDate = null,
    toDate = null,
    status = null,
    minAmount = null,
    maxAmount = null,
    code = null
  } = {}) {
    // Get all billings from IndexedDB
    const allBillings = await this.db.getCollection(this.#collectionName).toArray();
    
    // Apply filters
    const filteredBillings = allBillings.filter(billing => {
      let matches = true;
      
      // Date range filter
      if (fromDate) {
        const fromDateTimestamp = dayjs(fromDate).startOf('day').utcOffset(TIME_ZONE).valueOf();
        matches = matches && billing.createdAt?.date >= fromDateTimestamp;
      }
      
      if (toDate) {
        const toDateTimestamp = dayjs(toDate).endOf('day').utcOffset(TIME_ZONE).valueOf();
        matches = matches && billing.createdAt?.date <= toDateTimestamp;
      }
      
      // Status filter
      if (status) {
        matches = matches && billing.status === status;
      }
      
      // Amount range filter
      if (minAmount !== null) {
        matches = matches && billing.total >= minAmount;
      }
      
      if (maxAmount !== null) {
        matches = matches && billing.total <= maxAmount;
      }
      
      // Code filter (case insensitive partial match)
      if (code) {
        matches = matches && billing.code && billing.code.toLowerCase().includes(code.toLowerCase());
      }
      
      return matches;
    });
    
    // Sort by creation date (newest first)
    filteredBillings.sort((a, b) => {
      const dateA = a.createdAt?.date || 0;
      const dateB = b.createdAt?.date || 0;
      return dateB - dateA;
    });
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBillings = filteredBillings.slice(start, end);
    
    // Return with pagination info
    return {
      data: paginatedBillings,
      page,
      totalPages: Math.ceil(filteredBillings.length / limit),
      total: filteredBillings.length
    };
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
      // Filter by date AND billing status (include APPROVED or no status, exclude CANCELED)
      return createdAtTimestamp && createdAtTimestamp >= startDate && 
             (billing.status === undefined || billing.status !== 'CANCELED');
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
      // Filter by date AND billing status (include APPROVED or no status, exclude CANCELED)
      return createdAtTimestamp && createdAtTimestamp >= startDate && 
             (billing.status === undefined || billing.status !== 'CANCELED');
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

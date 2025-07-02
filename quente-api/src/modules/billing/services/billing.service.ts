import { singleton, container } from 'tsyringe';
import { BaseService } from '../../../helpers/abstracts/base.service';
import { SequencedCodeService } from './sequenced-code.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { KardexTransactionService } from '../../inventory/services/kardex-transaction.service';
import { KardexTransactionType } from '../../inventory/entities/enums/kardex-transaction-type';
import { Billing } from '../entities/Billing';
import { getStatsPipeline } from './stats.aggregate';
import { billingSchema, BillingStatus } from '../db/schemas/billing.schema';
import { SequencedCode } from '../entities/SequencedCode';
import { getTopSalesItems } from './top-sales.aggregate';
import { getBillingsByPaymentMethod } from './billingsByPaymentMethod.aggregate';
dayjs.extend(utc);

const kardexTransactionService = container.resolve(KardexTransactionService);
const sequencedCodeService = container.resolve(SequencedCodeService);

@singleton()
export class BillingService extends BaseService<Billing> {
  getModelName = () => 'Billing';
  getSchema = () => billingSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<Billing | null> {
    return await this.getModel().findById(id).exec();
  }
  // Override base method to support filtering
  async findAll(filter: any): Promise<Billing[]> {
    const { page = 1, filters = {} } = filter;
    const result = await this.findAllWithFilters({ page, filters });
    return result.data;
  }

  /**
   * Get paginated billings with filter support
   */
  async findAllWithFilters({ page = 1, filters = {} }: { page: number; filters?: any }): Promise<{ data: Billing[]; total: number; page: number; totalPages: number }> {
    const limit = 10;
    const skip = limit * (page - 1);
    
    // Build query object based on filters
    const query: any = {};
    
    // Apply date range filter
    if (filters.dateRange) {
      query['createdAt.date'] = {};
      let fromDateValue = null;
      let toDateValue = null;
      
      // Process fromDate if provided
      if (filters.dateRange.fromDate) {
        fromDateValue = dayjs(filters.dateRange.fromDate)
          .set('hours', 0)
          .set('minutes', 0)
          .set('seconds', 0)
          .utcOffset(-5);
          
        const fromDate = fromDateValue.toDate().getTime();
        query['createdAt.date'].$gte = fromDate;
      }
      
      // Process toDate if provided
      if (filters.dateRange.toDate) {
        toDateValue = dayjs(filters.dateRange.toDate)
          .set('hours', 23)
          .set('minutes', 59)
          .set('seconds', 59)
          .utcOffset(-5);
          
        const toDate = toDateValue.toDate().getTime();
        query['createdAt.date'].$lte = toDate;
      }
      
      // Validate date range if both dates are provided
      if (fromDateValue && toDateValue && toDateValue.isBefore(fromDateValue, 'day')) {
        throw new Error('La fecha final debe ser mayor o igual a la fecha inicial');
      }
    }
    
    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }
    // Apply code filter (case-insensitive partial match)
    if (filters.code) {
      query.code = { $regex: new RegExp(filters.code, 'i') };
    }
    
    // Execute query with pagination
    const [billings, total] = await Promise.all([
      this.getModel()
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'createdAt.date': -1 })
        .exec(),
      this.getModel().countDocuments(query)
    ]);
    
    return {
      data: billings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }
  async getBillingsByPaymentMethod({date, status}: {date: string, status?: Array<string | undefined>}): Promise<any[]> {
    const startDate = dayjs(date)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .utcOffset(-5)
      .toDate()
      .getTime();
    const billings: any[] = await this.getModel()
      .aggregate(getBillingsByPaymentMethod({startDate, status}))
      .exec();
    return billings;
  }
  async findGreaterThanDate({date, status}: {date: string, status?: Array<string | undefined>}): Promise<Billing[]> {
    const startDate = dayjs(date)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .utcOffset(-5)
      .toDate()
      .getTime();
    const billings: Billing[] = await this.getModel()
      .aggregate(getStatsPipeline({startDate, status}))
      .exec();
    return billings;
  }
  async findTopSalesItems({date, status}: {date: string, status?: Array<string | undefined>}): Promise<Billing[]> {
    const startDate = dayjs(date)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .utcOffset(-5)
      .toDate()
      .getTime();
    const billings: Billing[] = await this.getModel()
      .aggregate(getTopSalesItems({startDate, status}))
      .exec();
    return billings;
  }
  async save(billing: Billing): Promise<Billing> {
    try {
      billing.code = await generateSequencedCode();
      console.log({ billing });
      const saved = await this.getModel().create(billing);
      setImmediate(async () => await this.saveItemsMovements(saved));
      return saved;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async saveItemsMovements(billingSaved: Billing) {
    try {
      const itemsMovement = billingSaved.items.map(
        ({ _id, code, units = 1, multiplicity = 1 }) => ({
          itemId: _id,
          itemCode: code,
          units: units * multiplicity,
          type: KardexTransactionType.OUT,
          createdAt: billingSaved.createdAt,
          computed: false,
        }),
      );
      await kardexTransactionService.saveAll(itemsMovement);
    } catch (error) {
      console.error(error);
    }
  }

  async saveAll(billings: Billing[]): Promise<any> {
    try {
      for (const billing of billings) {
        billing.code = await generateSequencedCode();
      }
      const billingModels = billings.map(
        (billing) => new (this.getModel())(billing),
      );
      const result = await this.getModel().bulkSave(billingModels);
      return result;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  /**
   * Update a billing record
   * @param id - The ID of the billing to update
   * @param billing - The updated billing data
   * @returns The updated billing
   */
  async update(id: string, billing: Billing): Promise<Billing | null> {
    try {
      // Set updatedAt timestamp
      billing.updatedAt = new Date();

      // Update the billing record
      await this.getModel().updateOne({ _id: id }, billing);

      // Return the updated record
      return this.findOne(id);
    } catch (error) {
      console.error('Error updating billing:', error);
      return Promise.reject(null);
    }
  }

  /**
   * Find billings updated since a specific timestamp
   * @param timestamp - ISO string timestamp
   * @returns Array of billings updated since the timestamp
   */
  async findUpdatedSince(timestamp: string): Promise<Billing[]> {
    try {
      const date = new Date(timestamp);

      // Find billings where updatedAt or createdAt is greater than the timestamp
      const billings = await this.getModel()
        .find({
          $or: [{ updatedAt: { $gte: date } }, { createdAt: { $gte: date } }],
        })
        .exec();

      return billings;
    } catch (error) {
      console.error('Error finding updated billings:', error);
      return [];
    }
  }
  async countSince(startDateAsString: string): Promise<number> {
    const startDate = dayjs(startDateAsString)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .utcOffset(-5)
      .toDate()
      .getTime();
    const billingsCount: number = await this.getModel()
      .find({ 'createdAt.date': { $gte: startDate } })
      .countDocuments();
    return billingsCount;
  }

  /**
   * Update the status of a billing
   * @param id The ID of the billing to update
   * @param status The new status (APPROVED or CANCELED)
   * @returns The updated billing document
   */
  async updateStatus(id: string, status: BillingStatus): Promise<Billing | null> {
    try {
      const billing = await this.getModel().findById(id);
      
      if (!billing) {
        return null;
      }
      
      // Update the status and updatedAt fields
      billing.status = status;
      billing.updatedAt = new Date();
      
      await billing.save();
      return billing;
    } catch (error) {
      console.error('Error updating billing status:', error);
      return null;
    }
  }
}

async function generateSequencedCode(): Promise<string> {
  let generatedSequencedCode = '';
  const sequenceCode: SequencedCode | null =
    await sequencedCodeService.findLastOne();
  if (sequenceCode) {
    const { _id, prefixPart1, prefixPart2, sequence } = sequenceCode;
    if (_id && sequence !== undefined) {
      const newSequence = sequence + 1;
      sequenceCode.sequence = newSequence;
      await sequencedCodeService.update(_id.toString(), sequenceCode);
      generatedSequencedCode = `${prefixPart1}${prefixPart2}${newSequence}`;
    }
  }
  return generatedSequencedCode;
}

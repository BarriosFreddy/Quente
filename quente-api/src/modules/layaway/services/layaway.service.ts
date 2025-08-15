import { singleton, container } from 'tsyringe';
import { BaseService } from '../../../helpers/abstracts/base.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Layaway } from '../entities/Layaway';
import { layawaySchema, LayawayStatus } from '../db/schemas/layaway.schema';
import { LayawayPayment } from '../entities/LayawayPayment';
import { LayawayPaymentService } from './layaway-payment.service';
//import { ItemService } from '../../inventory/services/item.service';
import { Types } from 'mongoose';
import { Billing } from '../../billing/entities/Billing';
import { BillingService } from '../../billing/services/billing.service';
import { BillingStatus } from '../../billing/db/schemas/billing.schema';

dayjs.extend(utc);

const layawayPaymentService = container.resolve(LayawayPaymentService);
const billingService = container.resolve(BillingService);

@singleton()
export class LayawayService extends BaseService<Layaway> {
  getModelName = () => 'Layaway';
  getSchema = () => layawaySchema;
  getCollectionName = () => undefined;
  
  /**
   * Find a specific layaway by ID
   * @param id - Layaway ID
   * @returns Layaway document
   */
  async findOne(id: string): Promise<Layaway | null> {
    return await this.getModel().findById(id).exec();
  }

  async update(id: string, entity: Partial<Layaway>): Promise<Layaway | null> {
    return await this.getModel()
      .findByIdAndUpdate(id, entity, { new: true })
      .exec();
  }

  /**
   * Get paginated layaways with filter support
   * @param page - Page number
   * @param filters - Filter criteria
   * @returns Paginated list of layaways
   */
  async findAllWithFilters({ 
    page = 1, 
    filters = {} 
  }: { 
    page: number; 
    filters?: any 
  }): Promise<{ 
    data: Layaway[]; 
    total: number; 
    page: number; 
    totalPages: number 
  }> {
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
    
    // Apply client filters
    if (filters.clientName) {
      query['client.name'] = { $regex: new RegExp(filters.clientName, 'i') };
    }
    
    if (filters.email) {
      query['client.email'] = { $regex: new RegExp(filters.email, 'i') };
    }
    
    if (filters.phoneNumber) {
      query['client.phoneNumber'] = { $regex: new RegExp(filters.phoneNumber, 'i') };
    }
    
    // Execute query with pagination
    const [layaways, total] = await Promise.all([
      this.getModel()
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ 'createdAt.date': -1 })
        .exec(),
      this.getModel().countDocuments(query)
    ]);
    
    return {
      data: layaways,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }
  
  /**
   * Find all layaways based on filter criteria
   * @param filter - Filter criteria including pagination
   * @returns Array of layaways
   */
  async findAll(filter: any): Promise<Layaway[]> {
    const { page = 1, filters = {} } = filter;
    const result = await this.findAllWithFilters({ page, filters });
    return result.data;
  }

  /**
   * Create a new layaway plan
   * @param layawayData - Layaway data to save
   * @returns Created layaway document
   */
  async create(layawayData: Partial<Layaway>): Promise<Layaway> {
    try {

      // Calculate amounts
      layawayData.remainingAmount = (layawayData.totalAmount || 0) - (layawayData.initialPayment || 0);
      layawayData.paidAmount = layawayData.initialPayment;
      
      // Generate sequential code
      layawayData.code = await this.generateLayawayCode();
      
      // Set agreement date to current date if not provided
      if (!layawayData.agreementDate) {
        layawayData.agreementDate = new Date();
      }
      
      // Set current timestamp for createdAt if not provided
      if (!layawayData.createdAt) {
        const now = dayjs().utcOffset(-5);
        layawayData.createdAt = {
          date: now.toDate().getTime(),
          offset: -5,
        };
      }
      
      // Create the layaway
      const layaway = await this.getModel().create(layawayData);
      
      // Register initial payment if exists
      if ((layawayData.initialPayment || 0) > 0) {
        await this.registerInitialPayment(layaway);
      }

      if (layawayData.remainingAmount === 0) {
        await this.createBilling(layaway);
      }

      return layaway;
    } catch (error) {
      console.error('Error creating layaway plan:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Register the initial payment for a layaway
   * @param layaway - Layaway document
   */
  async registerInitialPayment(layaway: LayawayWithId): Promise<void> {
    try {
      if ((layaway.initialPayment || 0) > 0) {
        const paymentData: Partial<LayawayPayment> = {
          layawayId: layaway._id as any,
          amount: layaway.initialPayment,
          paymentMethod: 'EFECTIVO', // Default payment method
          receiptNumber: `INIT-${layaway.code}`,
          notes: 'Pago inicial',
          createdBy: layaway.createdBy,
        };
        
        const payment = await layawayPaymentService.create(paymentData);
        const paymentId = (payment as LayawayPaymentWithId)._id;
        // Update the layaway with the payment reference
        layaway.payments = layaway.payments || [];
        layaway.payments.push(paymentId as any);
        await this.getModel().updateOne(
          { _id: layaway._id as any },
          { $set: { payments: layaway.payments } }
        );
      }
    } catch (error) {
      console.error('Error registering initial payment:', error);
    }
  }
  
  /**
   * Reserve items in inventory for a layaway
   * @param layaway - Layaway document
   */
/*   async reserveItems(layaway: Layaway): Promise<void> {
    try {
      for (const item of layaway.items) {
        if (item._id) {
          await itemService.updateItemStatus(
            item._id.toString(),
            ItemStatus.RESERVED,
            `Reserved for Layaway ${layaway.code}`
          );
        }
      }
    } catch (error) {
      console.error('Error reserving items:', error);
    }
  } */
  
  /**
   * Release reserved items back to available status
   * @param layaway - Layaway document
   */
/*   async releaseReservedItems(layaway: Layaway): Promise<void> {
    try {
      for (const item of layaway.items) {
        if (item._id) {
          await itemService.updateItemStatus(
            item._id.toString(),
            ItemStatus.AVAILABLE,
            `Released from canceled Layaway ${layaway.code}`
          );
        }
      }
    } catch (error) {
      console.error('Error releasing reserved items:', error);
    }
  } */
  
  /**
   * Add a payment to a layaway plan
   * @param layawayId - ID of the layaway
   * @param paymentData - Payment data
   * @returns Updated layaway document
   */
  async addPayment(layawayId: string, paymentData: Partial<LayawayPayment>): Promise<Layaway> {
    try {
      // Find the layaway
      const layaway = await this.getModel().findById(layawayId);
      
      if (!layaway) {
        throw new Error('Plan separe no encontrado');
      }
      
      // Verify that the layaway is active
      if (layaway.status !== LayawayStatus.ACTIVE) {
        throw new Error(`No se pueden agregar pagos a un plan en estado ${layaway.status}`);
      }
      
      // Create the new payment
      const payment = await layawayPaymentService.create({
        ...paymentData,
        layawayId: new Types.ObjectId(layawayId) as any,
      });
      const paymentId = (payment as LayawayPaymentWithId)._id;

      
      // Update the layaway
      layaway.paidAmount += paymentData.amount;
      layaway.remainingAmount = (layaway.remainingAmount || 0) - (paymentData.amount || 0);
      layaway.payments = layaway.payments || [];
      layaway.payments.push(paymentId);
      
      // If the plan is fully paid
      if (layaway.remainingAmount <= 0) {
        layaway.status = LayawayStatus.COMPLETED;
        layaway.completionDate = new Date();
      }
      await layaway.save();
      if (layaway.remainingAmount <= 0) {
        await this.createBilling(layaway);
      }
      return layaway;
    } catch (error) {
      console.error('Error adding payment:', error);
      return Promise.reject(error);
    }
  }
    
  /**
   * Create a billing for a layaway
   * @param layaway - Layaway document
   */
  async createBilling(layaway: Layaway): Promise<void> {
    try {

      const layawayItems = layaway.items.map((item) => {
        return {
          _id: item._id,
          code: item.code,
          name: item.name,
          price: item.price,
          units: item.units,
          measurementUnit: "UNIDAD",
          multiplicity: 1,
        };
      });

      const billingData: Billing = {
        createdAt: {date: new Date().getTime(), offset: -5},
        receivedAmount: layaway.paidAmount,
        paymentMethod: 'EFECTIVO',
        billAmount: layaway.paidAmount,
        items: layawayItems,
        creationDate: dayjs().utcOffset(-5).format('YYYY-MM-DD'),
        client: {
          id: layaway.client?.id,
          name: layaway.client?.name,
        },
        seller: {
          id: layaway.createdBy?.id,
          name: layaway.createdBy?.name,
        },
        createdBy: {
          id: layaway.createdBy?.id,
          name: layaway.createdBy?.name,
        },
        status: BillingStatus.APPROVED,
      } as Billing;
      await billingService.save(billingData);
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  }
  /**
   * Mark a layaway as delivered
   * @param layawayId - ID of the layaway
   * @returns Updated layaway document
   */
  async markAsDelivered(layawayId: string): Promise<Layaway> {
    try {
      const layaway = await this.getModel().findById(layawayId);
      
      if (!layaway) {
        throw new Error('Plan separe no encontrado');
      }
      
      if (layaway.status !== LayawayStatus.COMPLETED) {
        throw new Error('Solo se pueden entregar planes completamente pagados');
      }
      
      layaway.status = LayawayStatus.DELIVERED;
      await layaway.save();
      
      return layaway;
    } catch (error) {
      console.error('Error marking layaway as delivered:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Cancel a layaway plan
   * @param layawayId - ID of the layaway
   * @param reason - Reason for cancellation
   * @returns Updated layaway document
   */
  async cancel(layawayId: string, reason: string): Promise<Layaway> {
    try {
      const layaway = await this.getModel().findById(layawayId);
      
      if (!layaway) {
        throw new Error('Plan separe no encontrado');
      }
      
      if (layaway.status === LayawayStatus.DELIVERED) {
        throw new Error('No se puede cancelar un plan ya entregado');
      }
      
      // Release the reserved items
      //await this.releaseReservedItems(layaway);
      
      layaway.status = LayawayStatus.CANCELED;
      layaway.notes = layaway.notes 
        ? `${layaway.notes}\nCANCELADO: ${reason}`
        : `CANCELADO: ${reason}`;
        
      await layaway.save();
      
      return layaway;
    } catch (error) {
      console.error('Error canceling layaway:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Generate a sequential code for a new layaway
   * @returns Generated code
   */
  async generateLayawayCode(): Promise<string> {
    try {
      // Find the last layaway to get the highest code
      const lastLayaway = await this.getModel()
        .findOne()
        .sort({ code: -1 })
        .exec();
      
      if (lastLayaway && lastLayaway.code) {
        // Extract the numeric part of the code
        const match = lastLayaway.code.match(/LAY(\d+)/);
        if (match && match[1]) {
          const lastNumber = parseInt(match[1], 10);
          const newNumber = lastNumber + 1;
          return `LAY${newNumber.toString().padStart(4, '0')}`;
        }
      }
      
      // Default initial code
      return 'LAY0001';
    } catch (error) {
      console.error('Error generating layaway code:', error);
      return 'LAY0001';
    }
  }
  async save(_entity: Partial<Layaway>): Promise<Layaway> {    
    throw new Error("Method not implemented");
  }
}


type LayawayWithId = Layaway & {
  _id: Types.ObjectId;
};

type LayawayPaymentWithId = LayawayPayment & {
  _id: Types.ObjectId;
};
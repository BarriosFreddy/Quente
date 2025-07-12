import { singleton } from 'tsyringe';
import { BaseService } from '../../../helpers/abstracts/base.service';
import { LayawayPayment } from '../entities/LayawayPayment';
import { layawayPaymentSchema } from '../db/schemas/layaway-payment.schema';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@singleton()
export class LayawayPaymentService extends BaseService<LayawayPayment> {
  getModelName = () => 'LayawayPayment';
  getSchema = () => layawayPaymentSchema;
  getCollectionName = () => undefined;

  async findOne(id: string): Promise<LayawayPayment | null> {
    return await this.getModel().findById(id).exec();
  }

  async save(entity: Partial<LayawayPayment>): Promise<LayawayPayment> {
    const model = this.getModel();
    const newEntity = new model(entity);
    return await newEntity.save();
  }

  async update(id: string, entity: Partial<LayawayPayment>): Promise<LayawayPayment | null> {
    return await this.getModel()
      .findByIdAndUpdate(id, entity, { new: true })
      .exec();
  }

  async findAll(filter: any = {}): Promise<LayawayPayment[]> {
    return await this.getModel().find(filter).exec();
  }

  /**
   * Creates a new payment for a layaway plan
   * @param paymentData - Payment data to save
   * @returns Created payment document
   */
  async create(paymentData: Partial<LayawayPayment>): Promise<LayawayPayment> {
    try {
      // Set current timestamp for paymentDate if not provided
      if (!paymentData.paymentDate) {
        const now = dayjs().utcOffset(-5);
        paymentData.paymentDate = {
          date: now.toDate().getTime(),
          offset: -5,
        };
      }

      // Set current timestamp for createdAt if not provided
      if (!paymentData.createdAt) {
        const now = dayjs().utcOffset(-5);
        paymentData.createdAt = {
          date: now.toDate().getTime(),
          offset: -5,
        };
      }

      const payment = await this.getModel().create(paymentData);
      return payment;
    } catch (error) {
      console.error('Error creating layaway payment:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Find payments by layaway ID
   * @param layawayId - ID of the layaway
   * @returns Array of payments for the specified layaway
   */
  async findByLayawayId(layawayId: string): Promise<LayawayPayment[]> {
    try {
      const payments = await this.getModel()
        .find({ layawayId })
        .sort({ 'paymentDate.date': 1 })
        .exec();
      return payments;
    } catch (error) {
      console.error('Error finding layaway payments:', error);
      return [];
    }
  }

  /**
   * Calculate total payments made for a specific layaway
   * @param layawayId - ID of the layaway
   * @returns Total amount paid
   */
  async getTotalPaidForLayaway(layawayId: string): Promise<number> {
    try {
      const payments = await this.findByLayawayId(layawayId);
      const total = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      return total;
    } catch (error) {
      console.error('Error calculating total paid for layaway:', error);
      return 0;
    }
  }
}

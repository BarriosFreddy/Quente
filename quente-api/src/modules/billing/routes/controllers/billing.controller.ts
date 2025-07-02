import { BillingService } from '../../services/billing.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { Billing } from '../../entities/Billing';
import { BillingStatus } from '../../db/schemas/billing.schema';
import { setTenantIdToService } from '../../../../helpers/util';
import { SequencedCodeService } from '../../services/sequenced-code.service';

const billingService = container.resolve(BillingService);
const sequenceCodeService = container.resolve(SequencedCodeService);

class BillingController {
  async findAll(req: Request, res: Response) {
    let { 
      page = 1,
      fromDate,
      toDate,
      status,
      code
    } = req.query;
    page = +page;
    
    // Build filter object
    const filters: any = {};
    
    // Date range filter
    if (fromDate || toDate) {
      filters.dateRange = {
        fromDate: fromDate as string,
        toDate: toDate as string
      };
    }
    
    // Status filter
    if (status) {
      filters.status = status as string;
    }
    // Code filter
    if (code) {
      filters.code = code as string;
    }
    
    await setTenantIdToService(res, sequenceCodeService);
    const bills = await setTenantIdToService(res, billingService).findAll({
      page,
      filters
    });
    res.status(200).send(bills);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    await setTenantIdToService(res, sequenceCodeService);
    const billing = await setTenantIdToService(res, billingService).findOne(id);
    res.status(200).send(billing);
  }
  async findGreaterThanDate(req: Request, res: Response) {
    const { date } = req.params;
    await setTenantIdToService(res, sequenceCodeService);
    const billings = await setTenantIdToService(
      res,
      billingService,
    ).findGreaterThanDate(date);
    res.status(200).send(billings);
  }

  async findTopSalesItems(req: Request, res: Response) {
    const { date } = req.params;
    const billings = await setTenantIdToService(
      res,
      billingService,
    ).findTopSalesItems(date);
    res.status(200).send(billings);
  }

  async save(req: Request, res: Response) {
    const billing: Billing = req.body;
    await setTenantIdToService(res, sequenceCodeService);
    const savedBill = await setTenantIdToService(res, billingService).save(
      billing,
    );
    res.status(201).send(savedBill);
  }

  async saveAll(req: Request, res: Response) {
    const billings: Billing[] = req.body;
    await setTenantIdToService(res, sequenceCodeService);
    const result = await setTenantIdToService(res, billingService).saveAll(
      billings,
    );
    res.status(201).send(result);
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate the status is one of our defined enum values
      if (!Object.values(BillingStatus).includes(status)) {
        res.status(400).json({ 
          message: 'Invalid status. Must be either APPROVED or CANCELED' 
        });
        return;
      }
      const updatedBilling = await setTenantIdToService(res, billingService).updateStatus(
        id,
        status as BillingStatus
      );

      if (!updatedBilling) {
        res.status(404).json({ message: 'Billing not found' });
        return;
      }

      res.status(200).json(updatedBilling);
    } catch (error) {
      console.error('Error updating billing status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

const billingController = new BillingController();
export default billingController;

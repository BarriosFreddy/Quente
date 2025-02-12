import { BillingService } from '../../services/billing.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { Billing } from '../../entities/Billing';
import { setTenantIdToService } from '../../../../helpers/util';
import { SequencedCodeService } from '../../services/sequenced-code.service';

const billingService = container.resolve(BillingService);
const sequenceCodeService = container.resolve(SequencedCodeService);

class BillingController {
  async findAll(req: Request, res: Response) {
    let { page = 1 } = req.query;
    page = +page;
    await setTenantIdToService(res, sequenceCodeService);
    const bills = await setTenantIdToService(res, billingService).findAll({
      page,
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
    await setTenantIdToService(res, sequenceCodeService);
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
}

const billingController = new BillingController();
export default billingController;

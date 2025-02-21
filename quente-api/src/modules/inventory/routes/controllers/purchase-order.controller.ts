import { Request, Response } from 'express';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrder } from '../../entities/PurchaseOrder';
import { container, singleton } from 'tsyringe';
import { setTenantIdToService } from '../../../../helpers/util';
const purchaseOrderService = container.resolve(PurchaseOrderService);

@singleton()
export default class PurchaseOrderController {
  constructor() {}

  async save(req: Request, res: Response) {
    try {
      const purchaseOrder: PurchaseOrder = req.body;
      const purchaseOrderSaved = await setTenantIdToService(
        res,
        purchaseOrderService,
      ).save(purchaseOrder);
      res.status(201).send(purchaseOrderSaved);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const purchaseOrder: PurchaseOrder = req.body;
    const purchaseOrderSaved = await setTenantIdToService(
      res,
      purchaseOrderService,
    ).update(id, purchaseOrder);
    purchaseOrderSaved
      ? res.status(201).send(purchaseOrderSaved)
      : res.status(400).send('Something went wrong');
  }

  async findAll(req: Request, res: Response) {
    try {
      const { page = 1 } = req.params;
      const purchaseOrders = await setTenantIdToService(
        res,
        purchaseOrderService,
      ).findAll({ page });
      res.status(200).send(purchaseOrders);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }
}

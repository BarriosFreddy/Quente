import express, { Express, Request, Response } from 'express';
import * as coreRouter from './modules/core/routes/index';
import * as billingRouter from './modules/billing/routes/index';
import * as inventoryRouter from './modules/inventory/routes/index';
import * as clientRouter from './modules/clients/routes/index';

export function registerRoutes(app: Express): void {
  const apiRouter = express.Router();
  apiRouter.get('/', (_req: Request, res: Response) => {
    res.send({
      appName: 'Quente',
      version: '0.0.1',
      description: 'Platform to support Micro-saas',
    });
  });
  apiRouter.use('/user-accounts', coreRouter.userAccountRouter);
  apiRouter.use('/roles', coreRouter.roleRouter);
  apiRouter.use('/auth', coreRouter.authRouter);
  apiRouter.use('/enumerations', coreRouter.enumerationsRouter);
  apiRouter.use('/organizations', coreRouter.organizationRouter);
  apiRouter.use('/branch-offices', coreRouter.branchOfficeRouter);

  apiRouter.use('/billings', billingRouter.billingRouter);
  apiRouter.use('/items', inventoryRouter.itemRouter);
  apiRouter.use('/item-categories', inventoryRouter.itemCategoryRouter);
  apiRouter.use('/kardex', inventoryRouter.kardexTransactionRouter);
  apiRouter.use('/purchase-orders', inventoryRouter.purchaseOrderRouter);
  apiRouter.use('/inv-enumerations', inventoryRouter.invEnumerationRouter);

  apiRouter.use('/clients', clientRouter.itemRouter);

  app.use('/api/v1', apiRouter);
}

import express, { Express, Request, Response } from 'express';
import * as coreRouter from './modules/core/routes/index';
import * as billingRouter from './modules/billing/routes/index';
import * as inventoryRouter from './modules/inventory/routes/index';
import * as clientRouter from './modules/clients/routes/index';
import healthRouter from './modules/core/routes/health.routes';
import syncRouter from './modules/core/routes/sync.routes';

export function registerRoutes(app: Express): void {
  const apiRouter = express.Router();
  apiRouter.get('/', (_req: Request, res: Response) => {
    res.send({
      appName: 'Quente',
      version: '0.0.1',
      description: 'Platform to support Micro-saas',
    });
  });

  // Core routes
  apiRouter.use('/user-accounts', coreRouter.userAccountRouter);
  apiRouter.use('/roles', coreRouter.roleRouter);
  apiRouter.use('/auth', coreRouter.authRouter);
  apiRouter.use('/enumerations', coreRouter.enumerationsRouter);
  apiRouter.use('/organizations', coreRouter.organizationRouter);
  apiRouter.use('/branch-offices', coreRouter.branchOfficeRouter);

  // Health check endpoint
  apiRouter.use('/health', healthRouter);

  // Sync endpoint for efficient data synchronization
  apiRouter.use('/sync', syncRouter);

  // Billing routes
  apiRouter.use('/billings', billingRouter.billingRouter);

  // Inventory routes
  apiRouter.use('/items', inventoryRouter.itemRouter);
  apiRouter.use('/item-categories', inventoryRouter.itemCategoryRouter);
  apiRouter.use('/kardex', inventoryRouter.kardexTransactionRouter);
  apiRouter.use('/purchase-orders', inventoryRouter.purchaseOrderRouter);
  apiRouter.use('/inv-enumerations', inventoryRouter.invEnumerationRouter);

  // Client routes
  apiRouter.use('/clients', clientRouter.itemRouter);

  app.use('/api/v1', apiRouter);
}

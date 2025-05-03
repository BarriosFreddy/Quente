import express from 'express';
import { asyncHandler } from '../../../helpers/middleware/async-handler.middleware';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { container } from 'tsyringe';
import { BadRequestError } from '../../../helpers/errors/app-error';
import { ItemService } from '../../inventory/services/item.service';
import { BillingService } from '../../billing/services/billing.service';

const syncRouter = express.Router();
const itemService = container.resolve(ItemService);
const billingService = container.resolve(BillingService);

// Endpoint for bulk operations (create, update, delete)
syncRouter.post(
  '/bulk',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { operations } = req.body;

    if (!operations || !Array.isArray(operations)) {
      throw new BadRequestError('Operations array is required');
    }

    const results = [];
    const errors = [];

    // Process each operation
    for (const op of operations) {
      try {
        const { entity, action, data } = op;

        if (!entity || !action || !data) {
          errors.push({
            operation: op,
            error: 'Invalid operation format. Required: entity, action, data',
          });
          continue;
        }

        let result;

        // Handle different entities
        switch (entity) {
          case 'items':
            result = await processItemOperation(action, data);
            break;
          case 'billings':
            result = await processBillingOperation(action, data);
            break;
          default:
            errors.push({
              operation: op,
              error: `Unsupported entity: ${entity}`,
            });
            continue;
        }

        results.push({
          entity,
          action,
          id: data._id,
          result,
        });
      } catch (error: Error | any) {
        errors.push({
          operation: op,
          error: error.message || 'Unknown error',
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
      errors,
      summary: {
        total: operations.length,
        succeeded: results.length,
        failed: errors.length,
      },
    });
  }),
);

// Endpoint to get changes since a specific timestamp
syncRouter.get(
  '/changes',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const { since } = req.query;

    // Default to 24 hours ago if no timestamp provided
    const sinceDate = since
      ? new Date(since as string)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get items updated since the timestamp
    const items = await itemService.findUpdatedSince(sinceDate.toISOString());

    // Get billings updated since the timestamp
    const billings = await billingService.findUpdatedSince(
      sinceDate.toISOString(),
    );

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      changes: {
        items,
        billings,
      },
    });
  }),
);

// Helper function to process item operations
async function processItemOperation(action: string, data: any) {
  switch (action) {
    case 'create':
      return await itemService.save(data);
    case 'update':
      return await itemService.update(data._id, data);
    case 'delete':
      // Implement delete functionality if needed
      throw new Error('Delete operation not implemented for items');
    default:
      throw new Error(`Unsupported action for items: ${action}`);
  }
}

// Helper function to process billing operations
async function processBillingOperation(action: string, data: any) {
  switch (action) {
    case 'create':
      return await billingService.save(data);
    case 'update':
      return await billingService.update(data._id, data);
    case 'delete':
      // Implement delete functionality if needed
      throw new Error('Delete operation not implemented for billings');
    default:
      throw new Error(`Unsupported action for billings: ${action}`);
  }
}

export default syncRouter;

import express from 'express';
import dashboardController from './controllers/dashboard.controller';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import { ModuleCode } from '../entities/enums/modules-codes';
import { Privilege } from '../entities/enums/privileges';
import { roleValidation } from '../../../helpers/middleware/role-validation.middleware';
import { generateAuthKeyPair } from '../../../helpers/util';

const dashboardRouter = express.Router();

/**
 * GET dashboard statistics
 * @route GET /api/dashboard
 * @param {string} startDate - Start date for filtering data (YYYY-MM-DD)
 * @returns {object} Dashboard statistics
 */
dashboardRouter.get(
  '/',
  isAuthenticated,
  roleValidation(generateAuthKeyPair(ModuleCode.BILLING, Privilege.ACCESS)),
  dashboardController.getDashboardStats,
);

export default dashboardRouter;

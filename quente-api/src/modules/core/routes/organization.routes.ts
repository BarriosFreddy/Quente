import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import {
  validateBody,
  validateParameters,
} from '../../../helpers/middleware/validation.middleware';

import organizationController from './controllers/organizations.controller';
import { idSchema } from '../../../helpers/db/schemas/id.schema';
import {
  OrganizationCreateSchema,
  OrganizationUpdateSchema,
} from './validations/organizations.schema';

const organizationRouter = express.Router();

organizationRouter.post(
  '/',
  validateBody(OrganizationCreateSchema),
  isAuthenticated,
  organizationController.save,
);
organizationRouter.put(
  '/:id',
  validateParameters(idSchema),
  validateBody(OrganizationUpdateSchema),
  isAuthenticated,
  organizationController.update,
);
organizationRouter.get(
  '/:id/active',
  validateParameters(idSchema),
  isAuthenticated,
  organizationController.active,
);
organizationRouter.get(
  '/:id/inactive',
  validateParameters(idSchema),
  isAuthenticated,
  organizationController.inactive,
);
organizationRouter.get(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  organizationController.findOne,
);
organizationRouter.get('/', isAuthenticated, organizationController.findAll);
organizationRouter.delete(
  '/:id',
  validateParameters(idSchema),
  isAuthenticated,
  organizationController.delete,
);

// Deploy organization endpoint for organizations in CREATING status
organizationRouter.post(
  '/:id/deploy',
  validateParameters(idSchema),
  isAuthenticated,
  organizationController.deploy,
);

export default organizationRouter;

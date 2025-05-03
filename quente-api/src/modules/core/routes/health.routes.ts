import express from 'express';
import { asyncHandler } from '../../../helpers/middleware/async-handler.middleware';

const healthRouter = express.Router();

// Simple health check endpoint
healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }),
);

export default healthRouter;

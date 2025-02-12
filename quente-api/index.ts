import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import express, { Express } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './src/routes';

const LIMIT_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LIMIT_RATE_MAX = 100;
const { PORT, NODE_ENV, FRONTEND_ORIGIN } = process.env;

const requiredEnvVars = ['PORT', 'NODE_ENV', 'FRONTEND_ORIGIN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const port = parseInt(PORT || '3000', 10);
if (isNaN(port)) {
  throw new Error('Invalid PORT environment variable');
}

const app: Express = express();

(async () => {
  try {
    app.use(helmet());
    app.use(cookieParser());
    app.use(
      cors({
        credentials: true,
        origin:
          NODE_ENV === 'production' ? FRONTEND_ORIGIN : 'http://localhost:3000',
      }),
    );
    app.use(compression() as express.RequestHandler);
    app.use(express.urlencoded({ extended: true, limit: '5mb' }));
    app.use(morgan('common'));
    app.use(
      express.json({
        limit: '5mb',
      }),
    ); // for parsing application/json

    app.use(
      rateLimit({
        windowMs: LIMIT_RATE_WINDOW_MS,
        max: LIMIT_RATE_MAX,
      }),
    );
    registerRoutes(app);

    const server = app.listen(PORT, () => {
      console.log(`Server is running. Available at http://localhost:${PORT}`);
    });
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();

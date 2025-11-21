// -----------------------------
// Environment & Config
// -----------------------------
import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import express, { Express, RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { registerRoutes } from './src/routes';
import { errorHandler } from './src/helpers/middleware/error-handler.middleware';
import healthRouter from './src/modules/core/routes/health.routes';

// -----------------------------
// Environment Validation
// -----------------------------
const requiredEnvVars = ['PORT', 'NODE_ENV', 'FRONTEND_ORIGIN'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Missing required environment variable: ${envVar}`);
  }
}

const PORT = Number(process.env.PORT);
const NODE_ENV = process.env.NODE_ENV;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

if (isNaN(PORT)) throw new Error('❌ Invalid PORT environment variable');

// -----------------------------
// App Initialization
// -----------------------------
const app: Express = express();

// -----------------------------
// Server Bootstrap
// -----------------------------
(async () => {
  try {
    // Security headers
    app.use(
      helmet({
        crossOriginResourcePolicy: false, // Permite cargar imágenes externas cuando usas CORS
      }) as RequestHandler,
    );

    // Cookies
    app.use(cookieParser());

    // CORS
    app.use(
      cors({
        credentials: true,
        origin:
          NODE_ENV === 'production'
            ? FRONTEND_ORIGIN
            : ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      }),
    );

    // Health check endpoint
    app.use('/health', healthRouter);

    // Compression
    app.use(compression());

    // Body parsers
    app.use(express.urlencoded({ extended: true, limit: '5mb' }));
    app.use(express.json({ limit: '5mb' }));

    // Logs
    app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

    // Rate Limit
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: true,
          message: 'Too many requests, please try again later.',
        },
      }),
    );

    // Routes
    registerRoutes(app);

    // Global Error Handler (siempre al final)
    app.use(errorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️ SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('⚠️ SIGINT received. Ctrl+C detected. Shutting down...');
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error('🔥 Server startup failed:', error);
    process.exit(1);
  }
})();

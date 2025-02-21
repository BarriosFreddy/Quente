import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './src/routes';

const { PORT = 3000, NODE_ENV, FRONTEND_ORIGIN } = process.env;

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
    app.use(compression());
    app.use(morgan('common'));
    app.use(
      express.json({
        limit: '5mb',
      }),
    ); // for parsing application/json
    registerRoutes(app);

    app.listen(PORT, () => {
      console.log(`Server is running. Available port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();

process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.log('\nuncaughtExceptionMonitor handler: {')
  console.log(`ERROR: ${error}`)
  console.log(`ORIGIN: ${origin}`)
  console.log('}\n')
})

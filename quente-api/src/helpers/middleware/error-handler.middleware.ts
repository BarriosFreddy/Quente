import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';

// Log error details
const logError = (err: Error): void => {
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
};

// Determine if error is trusted (operational) or not
const isTrustedError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Global error handler middleware
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
): void => {
  logError(err);

  // Handle AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: err.message,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
    return;
  }

  // Handle all other errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // If error is not trusted, we might want to perform additional actions
  if (!isTrustedError(err)) {
    // In a production app, you might want to notify your error tracking service
    // or restart the process using a process manager like PM2
    console.error('Untrusted error occurred:', err);
  }
};

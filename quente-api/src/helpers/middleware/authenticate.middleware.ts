import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../services/token.service';
import { UnauthorizedError } from '../errors/app-error';
import { asyncHandler } from './async-handler.middleware';

const isAuthenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from cookie
    const accessToken = req?.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedError('Authentication required. Please log in.');
    }

    try {
      // Verify the token
      const userData = TokenService.verifyToken(accessToken, 'access');

      if (!userData) {
        throw new UnauthorizedError('Invalid authentication token');
      }

      // Set user data in response locals for use in controllers
      res.locals.infoUser = userData;

      next();
    } catch (error) {
      // Handle specific UnauthorizedError instances
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      // Handle general errors from token verification
      if (
        error instanceof Error &&
        error.message === 'Authentication system configuration error'
      ) {
        console.error('Authentication configuration error:', error);
        throw new UnauthorizedError(
          'Authentication system error. Please contact support.',
        );
      }

      console.error('Authentication middleware error:', error);
      throw new UnauthorizedError('Authentication failed');
    }
  },
);

export default isAuthenticated;

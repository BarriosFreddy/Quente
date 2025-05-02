import { singleton } from 'tsyringe';
import { UserAccountLogin } from '../types/user-account-login.type';
import { UserAccountService } from './user-account.service';
import bcrypt from 'bcryptjs';
import { UserAccount } from '../entities/UserAccount';
import {
  TokenService,
  UserTokenData,
} from '../../../helpers/services/token.service';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from '../../../helpers/errors/app-error';
import { Request, Response } from 'express';

const { AUTH_DATABASE = '' } = process.env;

@singleton()
export class AuthService {
  constructor(public userAccountService: UserAccountService) {}

  async authenticate(userAccountLogin: UserAccountLogin) {
    if (!userAccountLogin.email || !userAccountLogin.password) {
      throw new BadRequestError('Email and password are required');
    }

    this.userAccountService.setTenantId = AUTH_DATABASE;
    const { email, password } = userAccountLogin;

    try {
      // Decode the base64 password
      const passwordBuffer = Buffer.from(password, 'base64');
      const decodedPassword = passwordBuffer.toString('utf-8');

      // Find the user account
      const userAccount: UserAccount | null =
        await this.userAccountService.findByEmail(email);
      if (!userAccount) {
        throw new NotFoundError('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        decodedPassword,
        userAccount.password || '',
      );

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Extract user data
      const { organization, _id, firstName, lastName, roles } = userAccount;

      // Create user data object for token
      const userData: UserTokenData = {
        roles,
        organization,
        id: _id,
        name: `${firstName} ${lastName}`,
      };

      try {
        // Generate tokens
        const accessToken = TokenService.generateAccessToken(userData);
        const refreshToken = TokenService.generateRefreshToken({ id: _id });

        return {
          ...userData,
          access_token: accessToken,
          refresh_token: refreshToken,
        };
      } catch (tokenError) {
        console.error('Token generation error:', tokenError);
        throw new UnauthorizedError(
          'Authentication system error. Please contact support.',
        );
      }
    } catch (error) {
      // Re-throw AppErrors
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      // Log and throw a generic error for unexpected issues
      console.error('Authentication error:', error);
      throw new UnauthorizedError('Authentication failed');
    }
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    try {
      // Verify the refresh token
      const userData = TokenService.verifyToken(refreshToken, 'refresh');

      // Get the user ID from the token
      const userId = userData.id;

      if (!userId) {
        throw new UnauthorizedError('Invalid refresh token: missing user ID');
      }

      // Fetch the user to ensure they still exist and are active
      this.userAccountService.setTenantId = AUTH_DATABASE;
      const userAccount = await this.userAccountService.findOne(userId);

      if (!userAccount) {
        throw new UnauthorizedError('User not found');
      }

      // Create user data for the new access token
      const { organization, _id, firstName, lastName, roles } = userAccount;
      const userDataForToken: UserTokenData = {
        roles,
        organization,
        id: _id,
        name: `${firstName} ${lastName}`,
      };

      try {
        // Generate a new access token
        const newAccessToken =
          TokenService.generateAccessToken(userDataForToken);

        return {
          access_token: newAccessToken,
        };
      } catch (tokenError) {
        console.error('Access token generation error:', tokenError);
        throw new UnauthorizedError(
          'Token refresh system error. Please log in again.',
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      console.error('Token refresh error:', error);
      throw new UnauthorizedError('Failed to refresh token');
    }
  }

  async logout(_req: Request, res: Response) {
    res.locals.infoUser = null;
    return res
      .status(200)
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      })
      .clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      })
      .send({ message: 'Logged out successfully' });
  }

  async infoUser(_req: Request, res: Response) {
    const { infoUser } = res.locals;
    if (infoUser) {
      res.status(200).send(infoUser);
    } else {
      throw new UnauthorizedError('User information not available');
    }
  }

  async initOrg(_dbName: string) {
    throw new Error('Not implemented yet');
  }
}

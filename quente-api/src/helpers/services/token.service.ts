import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/app-error';

const {
  SECRET_KEY,
  ACCESS_TOKEN_EXPIRY = '1h',
  REFRESH_TOKEN_EXPIRY = '7d',
} = process.env;

interface TokenPayload {
  data: UserTokenData;
  type: 'access' | 'refresh';
}

// Define a more specific user data interface to replace 'any'
export interface UserTokenData {
  id: any;
  name?: string;
  roles?: string[];
  organization?: { [key: string]: any };
  [key: string]: any; // Allow for additional properties
}

export class TokenService {
  /**
   * Validates that the SECRET_KEY is defined
   * @throws Error if SECRET_KEY is not defined
   */
  private static validateSecretKey(): string {
    if (!SECRET_KEY) {
      console.error('JWT Secret key is not defined in environment variables');
      throw new Error('Authentication system configuration error');
    }
    return SECRET_KEY;
  }

  /**
   * Generate an access token
   * @param data - Data to include in the token
   * @returns The generated access token
   */
  static generateAccessToken(data: UserTokenData): string {
    const secretKey = this.validateSecretKey();
    return jwt.sign(
      { data, type: 'access' } as TokenPayload,
      secretKey as jwt.Secret,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      } as jwt.SignOptions,
    );
  }

  /**
   * Generate a refresh token
   * @param data - Data to include in the token
   * @returns The generated refresh token
   */
  static generateRefreshToken(data: UserTokenData): string {
    const secretKey = this.validateSecretKey();
    return jwt.sign(
      { data, type: 'refresh' } as TokenPayload,
      secretKey as jwt.Secret,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      } as jwt.SignOptions,
    );
  }

  /**
   * Verify and decode a token
   * @param token - The token to verify
   * @param expectedType - The expected token type ('access' or 'refresh')
   * @returns The decoded token data
   * @throws UnauthorizedError if token is invalid or of wrong type
   */
  static verifyToken(
    token: string,
    expectedType: 'access' | 'refresh',
  ): UserTokenData {
    try {
      if (!token) {
        throw new UnauthorizedError('Token is required');
      }

      const secretKey = this.validateSecretKey();
      const decoded = jwt.verify(token, secretKey) as TokenPayload;

      // Verify token type
      if (decoded.type !== expectedType) {
        throw new UnauthorizedError(
          `Invalid token type. Expected ${expectedType} token.`,
        );
      }

      return decoded.data;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }

      // Handle any other unexpected errors
      console.error('Token verification error:', error);
      throw new UnauthorizedError('Token verification failed');
    }
  }
}

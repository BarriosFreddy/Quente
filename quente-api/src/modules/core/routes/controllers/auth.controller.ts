import { UserAccountLogin } from '../../types/user-account-login.type';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../../services/auth.service';
import { asyncHandler } from '../../../../helpers/middleware/async-handler.middleware';
import { UnauthorizedError } from '../../../../helpers/errors/app-error';

const { NODE_ENV = 'development' } = process.env;

const authService = container.resolve(AuthService);

class AuthController {
  authenticate = asyncHandler(async (req: Request, res: Response) => {
    const userAccountLogin: UserAccountLogin = req.body;
    const authData = await authService.authenticate(userAccountLogin);

    // Set the access token as an HTTP-only cookie
    res.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refresh_token', authData.refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user data without tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { access_token, refresh_token, ...userData } = authData;
    return res.status(200).json(userData);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const { access_token } = await authService.refreshToken(refreshToken);

    // Set the new access token as an HTTP-only cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({ message: 'Token refreshed successfully' });
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.locals.infoUser = null;

    // Clear both cookies
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  });

  infoUser = asyncHandler(async (_req: Request, res: Response) => {
    const { infoUser } = res.locals;

    if (!infoUser) {
      throw new UnauthorizedError('User information not available');
    }

    return res.status(200).json(infoUser);
  });

  initOrg = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.query;
    let conn = null;
    if (name && typeof name === 'string') {
      conn = await authService.initOrg(name);
      console.log({ conn });
    }
    res.send({ conn });
  });
}

const authController = new AuthController();
export default authController;

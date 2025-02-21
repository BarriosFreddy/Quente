import { UserAccountLogin } from '../../types/user-account-login.type';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthService } from '../../services/auth.service';

const { NODE_ENV = 'development' } = process.env;

const authService = container.resolve(AuthService);

class AuthController {
  async authenticate(req: Request, res: Response) {
    const userAccountLogin: UserAccountLogin = req.body;
    const data =
      (await authService.authenticate(userAccountLogin)) ??
      ({} as {
        access_token: string;
      });
    if (!data.access_token)
      return res.status(403).send({ message: 'credentials invalid' });

    return res
      .status(200)
      .cookie('access_token', data.access_token, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 720, // ms * m * h * M
      })
      .send(data);
  }

  async logout(_req: Request, res: Response) {
    res.locals.infoUser = null;
    return res
      .status(200)
      .clearCookie('access_token', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      })
      .send({ message: 'Logged out successfully' });
  }

  async infoUser(_req: Request, res: Response) {
    const { infoUser } = res.locals;
    if (infoUser) {
      res.status(200).send(infoUser);
    } else {
      res.status(403).send(null);
    }
  }

  async initOrg(req: Request, res: Response) {
    const { name } = req.query;
    let conn = null;
    if (name && typeof name === 'string') {
      conn = await authService.initOrg(name);
      console.log({ conn });
    }
    res.send({ conn });
  }
}

const authController = new AuthController();
export default authController;

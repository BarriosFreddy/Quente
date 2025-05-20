import { UserAccountService } from '../../services/user-account.service';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UserAccount } from '../../entities/UserAccount';
import { setTenantIdToService } from '../../../../helpers/util';

const userAccountService = container.resolve(UserAccountService);

class UserAccountsController {
  async findAll(_req: Request, res: Response) {
    const userAccounts = await setTenantIdToService(
      res,
      userAccountService,
    ).findAll();
    res.status(200).send(userAccounts);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const userAccount = await setTenantIdToService(
      res,
      userAccountService,
    ).findOne(id);
    res.status(200).send(userAccount);
  }

  async save(req: Request, res: Response) {
    const userAccount: UserAccount = req.body;
    const userAccountSaved = await setTenantIdToService(
      res,
      userAccountService,
    ).save(userAccount);
    res.status(201).send(userAccountSaved);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const userAccount: UserAccount = req.body;
    const userAccountSaved = await setTenantIdToService(
      res,
      userAccountService,
    ).update(id, userAccount);
    userAccountSaved
      ? res.status(201).send(userAccountSaved)
      : res.status(400).send('Something went wrong');
  }

  async resetPassword(req: Request, res: Response) {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .send({ success: false, message: 'Password is required' });
    }

    try {
      const success = await setTenantIdToService(
        res,
        userAccountService,
      ).resetPassword(id, password);

      if (success) {
        return res
          .status(200)
          .send({ success: true, message: 'Password reset successfully' });
      } else {
        return res
          .status(400)
          .send({ success: false, message: 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      return res
        .status(500)
        .send({ success: false, message: 'Internal server error' });
    }
  }
}

const userAccountController = new UserAccountsController();
export default userAccountController;

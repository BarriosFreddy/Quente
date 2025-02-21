import { userAccountSchema } from '../db/schemas/user-account.schema';
import bcrypt from 'bcryptjs';
import { singleton } from 'tsyringe';
import { BaseService } from '../../../helpers/abstracts/base.service';
import { UserAccount } from '../entities/UserAccount';
const ROUNDS_NUMBER = 12;

@singleton()
export class UserAccountService extends BaseService<UserAccount> {
  getModelName = () => 'UserAccount';
  getSchema = () => userAccountSchema;
  getCollectionName = () => 'user-accounts';

  async findOne(id: string) {
    return await this.getModel().findById(id).exec();
  }
  async findAll() {
    const userAccounts = await this.getModel().find().exec();
    return userAccounts;
  }

  async save(userAccount: UserAccount): Promise<UserAccount> {
    try {
      if (!userAccount.password) return Promise.reject(null);
      const salt = await bcrypt.genSalt(ROUNDS_NUMBER); // hash the password
      const hashedPassword = await bcrypt.hash(userAccount.password, salt);
      userAccount.password = hashedPassword;
      userAccount.createdAt = new Date();
      const userAccountSaved = await this.getModel().create(userAccount);
      return userAccountSaved;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async update(id: string, userAccount: UserAccount): Promise<any> {
    try {
      delete userAccount.password;
      userAccount.updatedAt = new Date();
      const { modifiedCount } = await this.getModel().updateOne(
        { _id: id },
        userAccount,
      );
      return !!modifiedCount;
    } catch (error) {
      console.log(error);
      return Promise.reject(null);
    }
  }

  async findByEmail(email: string): Promise<UserAccount | null> {
    try {
      return await this.getModel().findOne({ email });
    } catch (error) {
      return Promise.reject(null);
    }
  }
}

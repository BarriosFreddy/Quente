import { userAccountSchema } from '../db/schemas/user-account.schema';
import bcrypt from 'bcryptjs';
import { singleton } from 'tsyringe';
import { BaseService } from '../../../helpers/abstracts/base.service';
import { UserAccount } from '../entities/UserAccount';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { MongoDBService } from '../../../helpers/db/mongodb.service';
const ROUNDS_NUMBER = 12;

@singleton()
export class UserAccountService extends BaseService<UserAccount> {
  getModelName = () => 'UserAccount';
  getSchema = () => userAccountSchema;
  getCollectionName = () => 'user-accounts';

  async findOne(id: string) {
    return await this.getModel().findById(id).select('-password').exec();
  }

  // Override getConnection to use quente_admin database specifically for organizations
  protected getConnection() {
    mongoose.set('debug', true);
    return container.resolve(MongoDBService).getConnection('quente_admin');
  }

  async findAll() {
    const userAccounts = await this.getModel()
      .find()
      .select('-password')
      .exec();
    return userAccounts;
  }

  async save(userAccount: UserAccount, session?: any): Promise<UserAccount> {
    try {
      if (!userAccount.password) return Promise.reject(null);
      const salt = await bcrypt.genSalt(ROUNDS_NUMBER); // hash the password
      const hashedPassword = await bcrypt.hash(userAccount.password, salt);
      userAccount.password = hashedPassword;
      userAccount.createdAt = new Date();

      // If using a session, we must pass the document as an array per Mongoose docs
      let userAccountSaved;
      if (session) {
        // Use insertMany with session when a session is provided
        const result = await this.getModel().insertMany([userAccount], {
          session,
        });
        userAccountSaved = result[0];
      } else {
        // Use regular create when no session is provided
        userAccountSaved = await this.getModel().create(userAccount);
      }

      return userAccountSaved;
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  async update(id: string, userAccount: UserAccount): Promise<any> {
    try {
      // Remove sensitive or problematic fields
      delete userAccount.password;
      delete userAccount._id; // Exclude _id to prevent MongoDB errors

      // Add update metadata
      userAccount.updatedAt = new Date();

      // Perform update
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

  async resetPassword(id: string, password: string): Promise<boolean> {
    try {
      if (!password) return Promise.reject(false);
      const salt = await bcrypt.genSalt(ROUNDS_NUMBER);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { modifiedCount } = await this.getModel().updateOne(
        { _id: id },
        { password: hashedPassword, updatedAt: new Date() },
      );

      return !!modifiedCount;
    } catch (error) {
      console.log(error);
      return Promise.reject(false);
    }
  }
}

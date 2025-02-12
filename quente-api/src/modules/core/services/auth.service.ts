import { singleton } from 'tsyringe';
import { UserAccountLogin } from '../types/user-account-login.type';
import { UserAccountService } from './user-account.service';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { UserAccount } from '../entities/UserAccount';
const { SECRET_KEY, AUTH_DATABASE = '' } = process.env;

@singleton()
export class AuthService {
  constructor(public userAccountService: UserAccountService) {}

  async authenticate(userAccountLogin: UserAccountLogin) {
    this.userAccountService.setTenantId = AUTH_DATABASE;
    const { email, password } = userAccountLogin;
    const passwordBuffer = Buffer.from(password, 'base64');
    const userAccount: UserAccount | null =
      await this.userAccountService.findByEmail(email);
    if (!userAccount) return null;
    const decodedPassword = passwordBuffer.toString('utf-8');
    const isTheSame = await bcrypt.compare(
      decodedPassword,
      userAccount.password || '',
    );
    const { organization, _id, firstName, lastName } = userAccount;
    if (!isTheSame) return null;
    const data = {
      roles: userAccount.roles,
      organization,
      id: _id,
      name: `${firstName} ${lastName}`,
    };
    const access_token = this.generateToken(data);
    return { ...data, access_token };
  }

  private generateToken(data: {}): string {
    if (!SECRET_KEY) throw new Error('Secret key has not been set');
    const token = jsonwebtoken.sign(
      {
        data,
      },
      SECRET_KEY,
    );
    return token;
  }

  async initOrg(_dbName: string) {
    throw new Error('Not implemented yet');
  }
}

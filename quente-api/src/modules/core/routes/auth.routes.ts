import express from 'express';
import isAuthenticated from '../../../helpers/middleware/authenticate.middleware';
import authController from './controllers/auth.controller';
const authRouter = express.Router();

authRouter.post('/authenticate', authController.authenticate);
authRouter.get('/logout', authController.logout);
authRouter.get('/info-user', isAuthenticated, authController.infoUser);
authRouter.get('/init-org', authController.initOrg);

export default authRouter;

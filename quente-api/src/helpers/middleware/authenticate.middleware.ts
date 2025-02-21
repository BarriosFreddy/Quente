import { NextFunction, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
const { SECRET_KEY } = process.env;

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const access_token = req?.cookies?.access_token;
    if (!access_token) {
      res.status(403).send('authorization token is not valid');
      return;
    }
    if (!SECRET_KEY) throw new Error('Secret key has not been set');
    const decodedData = jsonwebtoken.verify(access_token, SECRET_KEY);
    if (typeof decodedData !== 'string') {
      const { data } = decodedData;
      res.locals.infoUser = data;
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(403).send('something went wrong');
  }
};

export default isAuthenticated;

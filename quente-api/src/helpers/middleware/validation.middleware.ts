import { NextFunction, Request, Response } from 'express';
import { Schema, ValidationError } from 'joi';

const validateBody = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      req.body = await schema.validateAsync(body, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');
        console.error('Validation Error:', errorMessage);
        res.status(422).json({ error: errorMessage });
      } else {
        console.error('Unexpected Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

const validateParameters = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = req;
      req.params = await schema.validateAsync(params, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessage = error.details
          .map((detail) => detail.message)
          .join(', ');
        console.error('Validation Error:', errorMessage);
        res.status(422).json({ error: errorMessage });
      } else {
        console.error('Unexpected Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

export { validateBody, validateParameters };

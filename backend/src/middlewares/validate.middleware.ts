import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors';
import { MESSAGES } from '../constants';

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError(errors.array(), MESSAGES.ERROR_VALIDATION));
  }
  next();
};

export default validate;

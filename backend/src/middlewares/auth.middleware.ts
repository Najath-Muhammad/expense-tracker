import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { MESSAGES } from '../constants';
import { AuthenticatedRequest, JwtPayload } from '../types';

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError(MESSAGES.ERROR_UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new UnauthorizedError(MESSAGES.ERROR_INVALID_TOKEN);
    }

    const user = await User.findById(decoded.sub).exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedError(MESSAGES.ERROR_USER_NOT_FOUND);
    }

    req.user = user.toSafeObject() as any;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError(MESSAGES.ERROR_INVALID_TOKEN));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(MESSAGES.ERROR_FORBIDDEN));
    }
    next();
  };
};

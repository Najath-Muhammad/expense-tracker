import { RequestHandler } from 'express';

export const asyncHandler = (fn: any): RequestHandler => {
  return ((req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }) as RequestHandler;
};

export default asyncHandler;

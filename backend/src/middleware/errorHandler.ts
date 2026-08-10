import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err.message.includes('Unique constraint')) {
    res.status(409).json({ success: false, message: 'Resource already exists (duplicate value)' });
    return;
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};

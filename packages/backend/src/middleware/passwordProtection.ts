import { Request, Response, NextFunction } from 'express';
import { SettingsModel } from '../models/Settings';
import { AppError } from './errorHandler';

export function passwordProtection(req: Request, _res: Response, next: NextFunction) {
  const settings = SettingsModel.get();

  if (!settings || !settings.passwordProtection) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Password required'));
  }

  const providedPassword = authHeader.substring(7);

  if (providedPassword !== settings.password) {
    return next(new AppError(401, 'Invalid password'));
  }

  next();
}

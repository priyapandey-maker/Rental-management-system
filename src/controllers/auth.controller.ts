import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const result = await authService.registerUser({ email, password, firstName, lastName });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const registerVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, companyName } = req.body;
    const result = await authService.registerVendor({ email, password, firstName, lastName, companyName });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

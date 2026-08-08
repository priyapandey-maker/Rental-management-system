import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.context.organizationId!;
    const summary = await dashboardService.getDashboardSummary(orgId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

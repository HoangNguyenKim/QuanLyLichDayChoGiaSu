import { Request, Response, NextFunction } from 'express';
import { dashboardService, DashboardService } from './dashboard.service';
import { successResponse } from '../../common/types/response';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /**
   * GET /api/dashboard/today
   * Get today's schedules with count.
   */
  getTodaySchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getTodaySchedules();
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/upcoming?days=7
   * Get upcoming schedules for the next N days.
   */
  getUpcomingSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const schedules = await this.service.getUpcomingSchedules(days);
      res.json(successResponse(schedules));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/income/weekly
   * Get weekly income summary.
   */
  getWeeklyIncome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getWeeklyIncome();
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/income/monthly
   * Get monthly income summary.
   */
  getMonthlyIncome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getMonthlyIncome();
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/income/stats
   * Get all income stats (weekly, monthly, total)
   */
  getIncomeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getIncomeStats();
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/todos
   * Get today's to-do list
   */
  getTodayTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getTodayTodos();
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController(dashboardService);

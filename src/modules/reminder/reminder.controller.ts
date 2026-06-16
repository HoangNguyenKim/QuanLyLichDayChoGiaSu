import { Request, Response, NextFunction } from 'express';
import { reminderService, ReminderService } from './reminder.service';
import { successResponse } from '../../common/types/response';

export class ReminderController {
  constructor(private readonly service: ReminderService) {}

  /**
   * GET /api/reminders
   * List all reminders, optionally filtered by scheduleId.
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scheduleId = req.query.scheduleId
        ? parseInt(req.query.scheduleId as string, 10)
        : undefined;
      const reminders = await this.service.getAll(scheduleId);
      res.json(successResponse(reminders));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reminders/:id
   * Get a single reminder by ID.
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const reminder = await this.service.getById(id);
      res.json(successResponse(reminder));
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/reminders
   * Create a new reminder.
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminder = await this.service.create(req.body);
      res.status(201).json(successResponse(reminder));
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/reminders/:id
   * Update an existing reminder.
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const reminder = await this.service.update(id, req.body);
      res.json(successResponse(reminder));
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/reminders/:id
   * Delete a reminder.
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.delete(id);
      res.json(successResponse({ message: 'Đã xóa nhắc nhở thành công' }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reminders/active
   * Get active reminders for today's uncompleted schedules.
   */
  getActiveReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reminders = await this.service.getActiveReminders();
      res.json(successResponse(reminders));
    } catch (error) {
      next(error);
    }
  };
}

export const reminderController = new ReminderController(reminderService);

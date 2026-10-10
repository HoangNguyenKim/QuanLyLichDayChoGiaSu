import { Request, Response, NextFunction } from 'express';
import { successResponse, warningResponse } from '../../common/types/response';
import { getPaginationParams, getPaginationMeta } from '../../common/utils/pagination';
import { ScheduleService, scheduleService } from './schedule.service';

export class ScheduleController {
  constructor(private service: ScheduleService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = getPaginationParams(req.query);
      const filters = {
        ...params,
        studentId: req.query.studentId
          ? parseInt(req.query.studentId as string, 10)
          : undefined,
        subjectId: req.query.subjectId
          ? parseInt(req.query.subjectId as string, 10)
          : undefined,
        completed:
          req.query.completed !== undefined
            ? req.query.completed === 'true'
            : undefined,
        date: req.query.date as string | undefined,
      };

      const { data, total } = await this.service.getAll(filters);
      const meta = getPaginationMeta(total, params);
      res.json(successResponse(data, meta));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const schedule = await this.service.getById(id);
      res.json(successResponse(schedule));
    } catch (error) {
      next(error);
    }
  };

  getWeekly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateString = req.query.date as string | undefined;
      const schedules = await this.service.getWeekly(dateString);
      res.json(successResponse(schedules));
    } catch (error) {
      next(error);
    }
  };

  getMonthly = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const month = req.query.month
        ? parseInt(req.query.month as string, 10)
        : undefined;
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : undefined;
      const schedules = await this.service.getMonthly(month, year);
      res.json(successResponse(schedules));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.create(req.body);
      if (result.warning) {
        res
          .status(201)
          .json(warningResponse(result.schedule, result.warningMessage!));
      } else {
        res.status(201).json(successResponse(result.schedule));
      }
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.service.update(id, req.body);
      if (result.warning) {
        res.json(warningResponse(result.schedule, result.warningMessage!));
      } else {
        res.json(successResponse(result.schedule));
      }
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.delete(id);
      res.json(successResponse({ message: 'Xóa lịch dạy thành công' }));
    } catch (error) {
      next(error);
    }
  };

  markCompleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const extraHours = req.body.extraHours ? parseFloat(req.body.extraHours) : undefined;
      const schedule = await this.service.markCompleted(id, extraHours);
      res.json(successResponse(schedule));
    } catch (error) {
      next(error);
    }
  };

  markLessonPrepared = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const schedule = await this.service.markLessonPrepared(id);
      res.json(successResponse(schedule));
    } catch (error) {
      next(error);
    }
  };

  checkConflict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, startTime, endTime, excludeId } = req.body;
      const result = await this.service.checkConflict(date, startTime, endTime, excludeId ? parseInt(excludeId, 10) : undefined);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  copyLastWeek = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dateString = req.body.date as string | undefined;
      const result = await this.service.copyLastWeekSchedules(dateString);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  exportICal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get all schedules
      const result = await this.service.getAll({ limit: 1000, page: 1 });
      const schedules = result.data;
      
      const ics = require('ics');
      const events: import('ics').EventAttributes[] = schedules.map(s => {
        const dateStr = (s.date as Date).toISOString().split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const [startHour, startMin] = s.startTime.split(':').map(Number);
        const [endHour, endMin] = s.endTime.split(':').map(Number);
        
        // Calculate duration
        let durationHours = endHour - startHour;
        let durationMins = endMin - startMin;
        if (durationMins < 0) {
          durationMins += 60;
          durationHours -= 1;
        }

        return {
          title: `Dạy: ${s.student?.fullName} - ${s.subject?.name}`,
          description: `Địa điểm: ${s.location || s.mode}\nNote: ${s.note || ''}\nGhi chú dạy: ${s.teachingNote || ''}`,
          start: [year, month, day, startHour, startMin],
          duration: { hours: durationHours, minutes: durationMins },
          location: s.location || (s.mode === 'ONLINE' ? 'Online' : undefined),
          status: s.completed ? 'CONFIRMED' : 'TENTATIVE',
        };
      });

      const { error, value } = ics.createEvents(events);
      
      if (error) {
        throw new Error('Failed to generate iCal format');
      }

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="quan-ly-gia-su.ics"');
      res.send(value);
    } catch (error) {
      next(error);
    }
  };
}

export const scheduleController = new ScheduleController(scheduleService);

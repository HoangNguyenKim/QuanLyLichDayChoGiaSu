import { AppError } from '../../common/errors';
import { PaginationParams } from '../../common/types/pagination';
import {
  parseDate,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
} from '../../common/utils/dateUtils';
import { ScheduleRepository, scheduleRepository } from './schedule.repository';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.dto';

interface ScheduleFilterParams extends PaginationParams {
  studentId?: number;
  subjectId?: number;
  completed?: boolean;
  date?: string;
}

interface ScheduleCreateResult {
  schedule: any;
  warning: boolean;
  warningMessage?: string;
}

export class ScheduleService {
  constructor(private repository: ScheduleRepository) {}

  async getAll(params: ScheduleFilterParams) {
    return this.repository.findAll(params);
  }

  async getById(id: number) {
    const schedule = await this.repository.findById(id);
    if (!schedule) {
      throw AppError.notFound(`Không tìm thấy lịch dạy với ID: ${id}`);
    }
    return schedule;
  }

  async getWeekly(dateString?: string) {
    const date = dateString ? parseDate(dateString) : new Date();
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = getEndOfWeek(date);
    return this.repository.findByDateRange(startOfWeek, endOfWeek);
  }

  async getMonthly(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month !== undefined ? month - 1 : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const targetDate = new Date(targetYear, targetMonth, 1);
    const startOfMonth = getStartOfMonth(targetDate);
    const endOfMonth = getEndOfMonth(targetDate);

    return this.repository.findByDateRange(startOfMonth, endOfMonth);
  }

  async create(data: CreateScheduleDto): Promise<ScheduleCreateResult> {
    const scheduleDate = parseDate(data.date);

    const conflicts = await this.repository.findConflicting(
      scheduleDate,
      data.startTime,
      data.endTime,
    );

    const schedule = await this.repository.create(data);

    if (conflicts.length > 0) {
      const conflictDetails = conflicts
        .map(
          (c) =>
            `${c.student.fullName} - ${c.subject.name} (${c.startTime}-${c.endTime})`,
        )
        .join(', ');

      return {
        schedule,
        warning: true,
        warningMessage: `Bạn có lịch trùng giờ với: ${conflictDetails}`,
      };
    }

    return { schedule, warning: false };
  }

  async update(id: number, data: UpdateScheduleDto): Promise<ScheduleCreateResult> {
    const existing = await this.getById(id);

    let conflicts: any[] = [];

    const dateChanged = data.date !== undefined;
    const timeChanged = data.startTime !== undefined || data.endTime !== undefined;

    if (dateChanged || timeChanged) {
      const checkDate = data.date ? parseDate(data.date) : existing.date;
      const checkStartTime = data.startTime || existing.startTime;
      const checkEndTime = data.endTime || existing.endTime;

      conflicts = await this.repository.findConflicting(
        checkDate instanceof Date ? checkDate : parseDate(checkDate as string),
        checkStartTime,
        checkEndTime,
        id,
      );
    }

    const schedule = await this.repository.update(id, data);

    if (conflicts.length > 0) {
      const conflictDetails = conflicts
        .map(
          (c) =>
            `${c.student.fullName} - ${c.subject.name} (${c.startTime}-${c.endTime})`,
        )
        .join(', ');

      return {
        schedule,
        warning: true,
        warningMessage: `Bạn có lịch trùng giờ với: ${conflictDetails}`,
      };
    }

    return { schedule, warning: false };
  }

  async delete(id: number) {
    await this.getById(id);
    return this.repository.delete(id);
  }

  async markCompleted(id: number) {
    const existing = await this.getById(id);
    return this.repository.markCompleted(id, !existing.completed);
  }

  async markLessonPrepared(id: number) {
    const existing = await this.getById(id);
    return this.repository.markLessonPrepared(id, !existing.lessonPrepared);
  }
}

export const scheduleService = new ScheduleService(scheduleRepository);

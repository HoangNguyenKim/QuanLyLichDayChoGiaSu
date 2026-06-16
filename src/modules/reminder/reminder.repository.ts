import prisma from '../../config/database';
import { CreateReminderDto, UpdateReminderDto } from './reminder.dto';
import { getStartOfDay, getEndOfDay } from '../../common/utils/dateUtils';

const scheduleInclude = {
  schedule: {
    include: {
      student: true,
      subject: true,
    },
  },
};

export class ReminderRepository {
  /**
   * Find all reminders, optionally filtered by scheduleId.
   * Includes schedule with student and subject relations.
   */
  async findAll(scheduleId?: number) {
    return prisma.reminder.findMany({
      where: scheduleId ? { scheduleId } : undefined,
      include: scheduleInclude,
      orderBy: {
        schedule: {
          date: 'asc',
        },
      },
    });
  }

  /**
   * Find a single reminder by ID.
   * Includes schedule with student and subject relations.
   */
  async findById(id: number) {
    return prisma.reminder.findUnique({
      where: { id },
      include: scheduleInclude,
    });
  }

  /**
   * Create a new reminder.
   */
  async create(data: CreateReminderDto) {
    return prisma.reminder.create({
      data: {
        scheduleId: data.scheduleId,
        remindBeforeMinutes: data.remindBeforeMinutes,
        enabled: data.enabled,
      },
      include: scheduleInclude,
    });
  }

  /**
   * Update an existing reminder.
   */
  async update(id: number, data: UpdateReminderDto) {
    return prisma.reminder.update({
      where: { id },
      data,
      include: scheduleInclude,
    });
  }

  /**
   * Delete a reminder by ID.
   */
  async delete(id: number) {
    return prisma.reminder.delete({
      where: { id },
    });
  }

  /**
   * Find all active (enabled) reminders for today's uncompleted schedules.
   * Includes schedule with student and subject relations.
   */
  async findActiveReminders() {
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    return prisma.reminder.findMany({
      where: {
        enabled: true,
        schedule: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          completed: false,
        },
      },
      include: scheduleInclude,
      orderBy: {
        schedule: {
          startTime: 'asc',
        },
      },
    });
  }
}

export const reminderRepository = new ReminderRepository();

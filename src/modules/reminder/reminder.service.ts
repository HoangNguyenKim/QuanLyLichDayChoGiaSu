import { AppError } from '../../common/errors';
import { ReminderRepository, reminderRepository } from './reminder.repository';
import { CreateReminderDto, UpdateReminderDto } from './reminder.dto';
import prisma from '../../config/database';

export class ReminderService {
  constructor(private readonly repository: ReminderRepository) {}

  /**
   * Get all reminders, optionally filtered by scheduleId.
   */
  async getAll(scheduleId?: number) {
    return this.repository.findAll(scheduleId);
  }

  /**
   * Get a single reminder by ID.
   * Throws NotFound if the reminder does not exist.
   */
  async getById(id: number) {
    const reminder = await this.repository.findById(id);
    if (!reminder) {
      throw AppError.notFound(`Không tìm thấy nhắc nhở với ID ${id}`, 'REMINDER_NOT_FOUND');
    }
    return reminder;
  }

  /**
   * Create a new reminder.
   * Validates that the referenced schedule exists.
   */
  async create(data: CreateReminderDto) {
    // Verify schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: data.scheduleId },
    });

    if (!schedule) {
      throw AppError.notFound(
        `Không tìm thấy lịch dạy với ID ${data.scheduleId}`,
        'SCHEDULE_NOT_FOUND',
      );
    }

    return this.repository.create(data);
  }

  /**
   * Update an existing reminder.
   * Throws NotFound if the reminder does not exist.
   */
  async update(id: number, data: UpdateReminderDto) {
    // Verify reminder exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Không tìm thấy nhắc nhở với ID ${id}`, 'REMINDER_NOT_FOUND');
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a reminder by ID.
   * Throws NotFound if the reminder does not exist.
   */
  async delete(id: number) {
    // Verify reminder exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Không tìm thấy nhắc nhở với ID ${id}`, 'REMINDER_NOT_FOUND');
    }

    return this.repository.delete(id);
  }

  /**
   * Get active (enabled) reminders for today's uncompleted schedules.
   */
  async getActiveReminders() {
    return this.repository.findActiveReminders();
  }
}

export const reminderService = new ReminderService(reminderRepository);

import { z } from 'zod';

export const createReminderSchema = z.object({
  scheduleId: z
    .number({ required_error: 'scheduleId là bắt buộc' })
    .int('scheduleId phải là số nguyên')
    .positive('scheduleId phải là số dương'),

  remindBeforeMinutes: z
    .number({ required_error: 'remindBeforeMinutes là bắt buộc' })
    .int('remindBeforeMinutes phải là số nguyên')
    .min(1, 'remindBeforeMinutes phải ít nhất 1 phút'),

  enabled: z
    .boolean()
    .default(true),
});

export const updateReminderSchema = z.object({
  remindBeforeMinutes: z
    .number()
    .int('remindBeforeMinutes phải là số nguyên')
    .min(1, 'remindBeforeMinutes phải ít nhất 1 phút')
    .optional(),

  enabled: z
    .boolean()
    .optional(),
});

export type CreateReminderDto = z.infer<typeof createReminderSchema>;
export type UpdateReminderDto = z.infer<typeof updateReminderSchema>;

import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createScheduleSchema = z.object({
  studentId: z.number().int().positive('Student ID phải là số dương'),
  subjectId: z.number().int().positive('Subject ID phải là số dương'),
  date: z.string().regex(dateRegex, 'Ngày phải có định dạng YYYY-MM-DD'),
  startTime: z.string().regex(timeRegex, 'Giờ bắt đầu phải có định dạng HH:mm'),
  endTime: z.string().regex(timeRegex, 'Giờ kết thúc phải có định dạng HH:mm'),
  location: z.string().optional(),
  locationDetail: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']).default('OFFLINE'),
  note: z.string().optional(),
  lessonPrepared: z.boolean().optional().default(false),
  estimatedIncome: z.number().min(0).optional().default(0),
  actualIncome: z.number().min(0).optional().default(0),
  teachingNote: z.string().optional(),
});

export const updateScheduleSchema = z.object({
  studentId: z.number().int().positive('Student ID phải là số dương').optional(),
  subjectId: z.number().int().positive('Subject ID phải là số dương').optional(),
  date: z.string().regex(dateRegex, 'Ngày phải có định dạng YYYY-MM-DD').optional(),
  startTime: z.string().regex(timeRegex, 'Giờ bắt đầu phải có định dạng HH:mm').optional(),
  endTime: z.string().regex(timeRegex, 'Giờ kết thúc phải có định dạng HH:mm').optional(),
  location: z.string().optional(),
  locationDetail: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE']).optional(),
  note: z.string().optional(),
  lessonPrepared: z.boolean().optional(),
  completed: z.boolean().optional(),
  estimatedIncome: z.number().min(0).optional(),
  actualIncome: z.number().min(0).optional(),
  teachingNote: z.string().optional(),
});

export type CreateScheduleDto = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDto = z.infer<typeof updateScheduleSchema>;

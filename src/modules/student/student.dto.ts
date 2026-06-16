import { z } from 'zod';

export const createStudentSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  address: z.string().optional(),
  apartmentFloor: z.string().optional(),
  parentPhone: z.string().optional(),
  note: z.string().optional(),
  subjectIds: z.array(z.number().int().positive()).optional(),
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
  address: z.string().optional(),
  apartmentFloor: z.string().optional(),
  parentPhone: z.string().optional(),
  note: z.string().optional(),
  subjectIds: z.array(z.number().int().positive()).optional(),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;

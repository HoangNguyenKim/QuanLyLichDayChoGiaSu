import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Tên môn học không được để trống'),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Tên môn học không được để trống').optional(),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { errorResponse } from '../types/response';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json(errorResponse('CONFLICT', 'Dữ liệu đã tồn tại.'));
        return;
      case 'P2025':
        res.status(404).json(errorResponse('NOT_FOUND', 'Không tìm thấy dữ liệu.'));
        return;
      case 'P2003':
        res.status(400).json(errorResponse('FOREIGN_KEY_ERROR', 'Dữ liệu liên quan không tồn tại.'));
        return;
      default:
        res.status(400).json(errorResponse('DATABASE_ERROR', err.message));
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(errorResponse('VALIDATION_ERROR', 'Dữ liệu không hợp lệ.'));
    return;
  }

  res.status(500).json(errorResponse('INTERNAL_ERROR', 'Lỗi hệ thống. Vui lòng thử lại sau.'));
}

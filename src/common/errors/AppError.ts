export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static notFound(message: string, code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static internal(message: string, code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }
}

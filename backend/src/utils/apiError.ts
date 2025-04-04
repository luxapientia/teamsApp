export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    
    // This line is needed to properly capture the stack trace in TypeScript
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string): ApiError {
    return new ApiError(message, 404);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(message, 500);
  }
} 
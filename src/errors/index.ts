import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'A database error occurred') {
    super(message, 500);
  }
}

export class ConcurrencyError extends AppError {
  constructor(message: string = 'A concurrency conflict occurred') {
    super(message, 409);
  }
}

export { AppError };

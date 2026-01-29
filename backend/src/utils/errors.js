/**
 * Custom Error Classes
 * מחלקות שגיאה מותאמות אישית למערכת
 */

/**
 * Base Application Error
 * שגיאת בסיס למערכת
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request
 * בקשה לא תקינה
 */
class BadRequestError extends AppError {
  constructor(message = 'בקשה לא תקינה') {
    super(message, 400);
  }
}

/**
 * 401 - Unauthorized
 * לא מורשה - דורש התחברות
 */
class UnauthorizedError extends AppError {
  constructor(message = 'נדרשת הרשאה. אנא התחבר למערכת') {
    super(message, 401);
  }
}

/**
 * 403 - Forbidden
 * אסור - אין הרשאות מספיקות
 */
class ForbiddenError extends AppError {
  constructor(message = 'אין לך הרשאות לבצע פעולה זו') {
    super(message, 403);
  }
}

/**
 * 404 - Not Found
 * לא נמצא
 */
class NotFoundError extends AppError {
  constructor(resource = 'המשאב') {
    super(`${resource} לא נמצא`, 404);
  }
}

/**
 * 409 - Conflict
 * קונפליקט - למשל, כפילות
 */
class ConflictError extends AppError {
  constructor(message = 'קיים קונפליקט עם הנתונים הקיימים') {
    super(message, 409);
  }
}

/**
 * 422 - Unprocessable Entity
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message = 'שגיאת וולידציה', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 429 - Too Many Requests
 * יותר מדי בקשות
 */
class RateLimitError extends AppError {
  constructor(message = 'יותר מדי בקשות. אנא נסה שוב מאוחר יותר') {
    super(message, 429);
  }
}

/**
 * 500 - Internal Server Error
 * שגיאת שרת פנימית
 */
class InternalServerError extends AppError {
  constructor(message = 'שגיאת שרת פנימית') {
    super(message, 500);
  }
}

/**
 * 503 - Service Unavailable
 * שירות לא זמין
 */
class ServiceUnavailableError extends AppError {
  constructor(message = 'השירות אינו זמין כרגע') {
    super(message, 503);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError
};

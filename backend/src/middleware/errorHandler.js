/**
 * Error Handler Middleware
 * Middleware מרכזי לטיפול בכל השגיאות במערכת
 */

const { AppError } = require('../utils/errors');

/**
 * Error Response Builder
 * בונה תגובת שגיאה אחידה
 */
const buildErrorResponse = (err, req) => {
  const response = {
    success: false,
    status: err.status || 'error',
    message: err.message || 'שגיאה לא צפויה',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // הוסף validation errors אם קיימים
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // במצב development - הוסף stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  return response;
};

/**
 * Log Error
 * רישום השגיאה ללוג
 */
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode,
    message: err.message,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous',
    userAgent: req.get('user-agent')
  };

  // Log לפי רמת חומרה
  if (err.statusCode >= 500) {
    console.error('❌ Server Error:', errorLog);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
  } else if (err.statusCode >= 400) {
    console.warn('⚠️ Client Error:', errorLog);
  } else {
    console.log('ℹ️ Error:', errorLog);
  }
};

/**
 * Handle Mongoose Validation Error
 * טיפול בשגיאות וולידציה של Mongoose
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));

  return {
    message: 'שגיאת וולידציה',
    statusCode: 422,
    errors
  };
};

/**
 * Handle Mongoose Duplicate Key Error
 * טיפול בשגיאת duplicate key
 */
const handleMongoDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return {
    message: `${field} "${value}" כבר קיים במערכת`,
    statusCode: 409,
    errors: [{
      field,
      message: 'ערך זה כבר קיים',
      value
    }]
  };
};

/**
 * Handle Mongoose Cast Error
 * טיפול בשגיאת cast (ID לא תקין)
 */
const handleMongoCastError = (err) => {
  return {
    message: `ערך לא תקין עבור ${err.path}: ${err.value}`,
    statusCode: 400
  };
};

/**
 * Handle JWT Errors
 * טיפול בשגיאות JWT
 */
const handleJWTError = () => {
  return {
    message: 'טוקן לא תקין. אנא התחבר מחדש',
    statusCode: 401
  };
};

const handleJWTExpiredError = () => {
  return {
    message: 'הטוקן פג תוקף. אנא התחבר מחדש',
    statusCode: 401
  };
};

/**
 * Main Error Handler Middleware
 * Middleware ראשי לטיפול בשגיאות
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log the error
  logError(err, req);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const handled = handleMongooseValidationError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.errors = handled.errors;
  }

  if (err.code === 11000) {
    const handled = handleMongoDuplicateKeyError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.errors = handled.errors;
  }

  if (err.name === 'CastError') {
    const handled = handleMongoCastError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
  }

  if (err.name === 'JsonWebTokenError') {
    const handled = handleJWTError();
    error.message = handled.message;
    error.statusCode = handled.statusCode;
  }

  if (err.name === 'TokenExpiredError') {
    const handled = handleJWTExpiredError();
    error.message = handled.message;
    error.statusCode = handled.statusCode;
  }

  // Build and send response
  const response = buildErrorResponse(error, req);
  res.status(error.statusCode).json(response);
};

/**
 * Not Found Handler
 * טיפול ב-404
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} לא נמצא בשרת`,
    404
  );
  next(error);
};

/**
 * Async Handler Wrapper
 * עוטף פונקציות async כדי לתפוס שגיאות
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

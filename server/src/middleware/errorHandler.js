import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      error: `Validation error: ${errorMessages}`,
      details: err.errors,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid format for field: ${err.path}`,
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected server error occurred',
  });
}

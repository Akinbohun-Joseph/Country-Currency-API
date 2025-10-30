import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('❌ Unhandled error:', {
    message: err.message || err,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  const statusCode = err.statusCode || err.status || 500;
  
  let message = 'Internal server error';
  
  if (err.message) {
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  }
  
  const errorResponse: any = {
    error: message
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.url} does not exist`,
    availableRoutes: [
      'POST /countries/refresh',
      'GET /countries',
      'GET /countries/:name',
      'DELETE /countries/:name',
      'GET /countries/image',
      'GET /status'
    ]
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

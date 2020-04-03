import { Request, Response, NextFunction } from 'express';


// eslint-disable-next-line no-unused-vars, no-shadow
export default function errorHandler(err, req: Request, res: Response, next: NextFunction) {
  const errors = err.errors || [{ message: err.message }];
  res.status(err.status || 500).json({ errors })
}


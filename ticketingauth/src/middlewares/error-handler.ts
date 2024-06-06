import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../errors/custom-error'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() })
  }
  // error argument: is always going to be some kind of error object (error that gets thrown by some code that we write)
  res.status(400).send({
    errors: [
      {
        message: 'Something went wrong',
      },
    ],
  })
}

import { NextFunction, Request, Response } from "express";

export interface ierr extends Error {
  statusCode: number;
}

export class bigError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number, option?: ErrorOptions) {
    super(message, option);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class badRequest extends bigError {
  constructor(message: string, option?: ErrorOptions) {
    super(message, 400, option);
  }
}

export class confilect extends bigError {
  constructor(message: string, option?: ErrorOptions) {
    super(message, 409, option);
  }
}

export let errorHandling = function (
  err: ierr,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "somthing wrong",
    stack: process.env.MOODE == "dev" ? err.stack : undefined,
    cause: err.cause,
  });
};

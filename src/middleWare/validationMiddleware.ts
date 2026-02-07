import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { badRequest } from "../utils/response/response.error";
type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationErrors: any[] = [];

    for (const key of Object.keys(schema) as KeyReqType[]) {
      const currentSchema = schema[key];
      if (!currentSchema) continue;

      if (req.file) {
        req.body.attachments = req.file;
      }
      if (req.files) {
        req.body.attachments = req.files;
      }

      const validationResult = currentSchema.safeParse(req[key]);

      if (!validationResult.success) {
        let error = validationResult.error;
        validationErrors.push({
          key,
          issues: error.issues.map(function (ele) {
            return { message: ele.message, path: ele.path };
          }),
        });
      }
    }

    if (validationErrors.length > 0) {
      throw new badRequest("Validation Error", {
        cause: validationErrors,
      });
    }

    return next() as unknown as NextFunction;
  };
};

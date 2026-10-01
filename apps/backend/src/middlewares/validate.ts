import { RequestHandler } from "express";
import { ZodSchema } from "@shared/types";

type Target = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, target: Target = "body"): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) return next(result.error);
    // Express 5 makes req.query read-only, so only overwrite body/params
    if (target !== "query") req[target] = result.data;
    next();
  };
import { ErrorRequestHandler } from "express";
import { ZodError } from "@shared/types";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ errors: err.flatten() });
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
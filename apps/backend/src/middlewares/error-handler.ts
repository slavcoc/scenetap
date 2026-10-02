import { ErrorRequestHandler } from "express";
import { ZodError } from "@shared/types";
import { AppError } from "../app-error";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ errors: err.flatten() });
  if (err instanceof AppError) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
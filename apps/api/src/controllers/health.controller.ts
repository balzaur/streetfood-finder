import { Request, Response } from "express";
import type { HealthCheck } from "@ultimate-sf/shared";

export const getHealth = (_req: Request, res: Response) => {
  const response: HealthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  res.json(response);
};

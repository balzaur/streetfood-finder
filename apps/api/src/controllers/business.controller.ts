import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../utils/api-response.js";
import * as businessService from "../services/business.service.js";

/**
 * POST /api/v1/users/:userId/business
 * Create business for a user
 */
export const createBusiness = asyncHandler(
  async (req: Request, res: Response) => {
    const business = await businessService.createBusiness(
      req.params.userId,
      req.body
    );
    sendCreated(res, business);
  }
);

/**
 * GET /api/v1/users/:userId/business
 * Get business(es) for a user
 */
export const getBusinesses = asyncHandler(
  async (req: Request, res: Response) => {
    const businesses = await businessService.getBusinessesByUserId(
      req.params.userId
    );
    sendSuccess(res, businesses);
  }
);

/**
 * POST /api/v1/users/:userId/business/:businessId
 * Update business for a user
 */
export const updateBusiness = asyncHandler(
  async (req: Request, res: Response) => {
    const business = await businessService.updateBusiness(
      req.params.businessId,
      req.params.userId,
      req.body
    );
    sendSuccess(res, business);
  }
);

/**
 * DELETE /api/v1/users/:userId/business/:businessId
 * Delete business for a user
 */
export const deleteBusiness = asyncHandler(
  async (req: Request, res: Response) => {
    await businessService.deleteBusiness(
      req.params.businessId,
      req.params.userId
    );
    sendNoContent(res);
  }
);

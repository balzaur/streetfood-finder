import { Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../utils/api-response.js";
import * as businessService from "../services/business.service.js";

/**
 * POST /api/v1/business
 * Create business for authenticated user
 */
export const createBusiness = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const business = await businessService.createBusiness(req.userId, req.body);
    sendCreated(res, business);
  }
);

/**
 * GET /api/v1/business
 * Get all businesses for authenticated user
 */
export const getMyBusinesses = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const businesses = await businessService.getBusinessesByProfileId(
      req.userId
    );
    sendSuccess(res, businesses);
  }
);

/**
 * GET /api/v1/business/:businessId
 * Get single business by ID (must be owned by authenticated user)
 */
export const getBusiness = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const business = await businessService.getBusinessById(
      req.params.businessId,
      req.userId
    );
    sendSuccess(res, business);
  }
);

/**
 * PUT /api/v1/business/:businessId
 * Update business (must be owned by authenticated user)
 */
export const updateBusiness = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const business = await businessService.updateBusiness(
      req.params.businessId,
      req.userId,
      req.body
    );
    sendSuccess(res, business);
  }
);

/**
 * DELETE /api/v1/business/:businessId
 * Delete business (must be owned by authenticated user)
 */
export const deleteBusiness = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    await businessService.deleteBusiness(req.params.businessId, req.userId);
    sendNoContent(res);
  }
);

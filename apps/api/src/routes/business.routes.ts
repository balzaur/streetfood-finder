import { Router, IRouter } from "express";
import * as businessController from "../controllers/business.controller.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";
import {
  createBusinessSchema,
  updateBusinessSchema,
  userIdParamSchema,
  userBusinessParamsSchema,
} from "../validators/index.js";

const router: IRouter = Router();

/**
 * POST /api/v1/users/:userId/business
 * Create business for a user
 */
router.post(
  "/:userId/business",
  validateParams(userIdParamSchema),
  validateBody(createBusinessSchema),
  businessController.createBusiness
);

/**
 * GET /api/v1/users/:userId/business
 * Get business(es) for a user
 */
router.get(
  "/:userId/business",
  validateParams(userIdParamSchema),
  businessController.getBusinesses
);

/**
 * POST /api/v1/users/:userId/business/:businessId
 * Update business for a user
 */
router.post(
  "/:userId/business/:businessId",
  validateParams(userBusinessParamsSchema),
  validateBody(updateBusinessSchema),
  businessController.updateBusiness
);

/**
 * DELETE /api/v1/users/:userId/business/:businessId
 * Delete business for a user
 */
router.delete(
  "/:userId/business/:businessId",
  validateParams(userBusinessParamsSchema),
  businessController.deleteBusiness
);

export default router;

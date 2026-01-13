import { Router, IRouter } from "express";
import * as businessController from "../controllers/business.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";
import {
  createBusinessSchema,
  updateBusinessSchema,
  businessIdParamSchema,
} from "../validators/index.js";

const router: IRouter = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/v1/business
 * Create business for authenticated user
 */
router.post(
  "/",
  validateBody(createBusinessSchema),
  businessController.createBusiness
);

/**
 * GET /api/v1/business
 * Get all businesses for authenticated user
 */
router.get("/", businessController.getMyBusinesses);

/**
 * GET /api/v1/business/:businessId
 * Get single business by ID (owned by authenticated user)
 */
router.get(
  "/:businessId",
  validateParams(businessIdParamSchema),
  businessController.getBusiness
);

/**
 * PUT /api/v1/business/:businessId
 * Update business (owned by authenticated user)
 */
router.put(
  "/:businessId",
  validateParams(businessIdParamSchema),
  validateBody(updateBusinessSchema),
  businessController.updateBusiness
);

/**
 * DELETE /api/v1/business/:businessId
 * Delete business (owned by authenticated user)
 */
router.delete(
  "/:businessId",
  validateParams(businessIdParamSchema),
  businessController.deleteBusiness
);

export default router;

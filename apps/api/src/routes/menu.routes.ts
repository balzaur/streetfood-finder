import { Router, IRouter } from "express";
import * as menuController from "../controllers/menu.controller.js";
import { validateParams } from "../middlewares/validate.middleware.js";
import {
  businessIdParamSchema,
  businessMenuParamsSchema,
} from "../validators/index.js";

const router: IRouter = Router();

/**
 * POST /api/v1/business/:businessId/menu
 * Create menu for a business (with image uploads)
 */
router.post(
  "/:businessId/menu",
  validateParams(businessIdParamSchema),
  menuController.uploadMenuImages,
  menuController.createMenu
);

/**
 * GET /api/v1/business/:businessId/menu
 * Get menu(s) for a business
 */
router.get(
  "/:businessId/menu",
  validateParams(businessIdParamSchema),
  menuController.getMenus
);

/**
 * POST /api/v1/business/:businessId/menu/:menuId
 * Update menu for a business (optionally with new images)
 */
router.post(
  "/:businessId/menu/:menuId",
  validateParams(businessMenuParamsSchema),
  menuController.uploadMenuImages,
  menuController.updateMenu
);

/**
 * DELETE /api/v1/business/:businessId/menu/:menuId
 * Delete menu for a business
 */
router.delete(
  "/:businessId/menu/:menuId",
  validateParams(businessMenuParamsSchema),
  menuController.deleteMenu
);

export default router;

import { Router, IRouter } from "express";
import * as usersController from "../controllers/users.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import {
  facebookLoginSchema,
  updateUserSchema,
  uuidParamSchema,
  paginationQuerySchema,
} from "../validators/index.js";

const router: IRouter = Router();

/**
 * POST /api/v1/users/facebook
 * Create or get user via Facebook login
 */
router.post(
  "/facebook",
  validateBody(facebookLoginSchema),
  usersController.facebookLogin
);

/**
 * GET /api/v1/users
 * Get all users with pagination
 */
router.get(
  "/",
  validateQuery(paginationQuerySchema),
  usersController.getAllUsers
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
router.get("/:id", validateParams(uuidParamSchema), usersController.getUser);

/**
 * POST /api/v1/users/:id
 * Update user by ID
 */
router.post(
  "/:id",
  validateParams(uuidParamSchema),
  validateBody(updateUserSchema),
  usersController.updateUser
);

/**
 * DELETE /api/v1/users/:id
 * Delete user by ID
 */
router.delete(
  "/:id",
  validateParams(uuidParamSchema),
  usersController.deleteUser
);

export default router;

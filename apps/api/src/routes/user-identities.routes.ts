import { Router, IRouter } from "express";
import * as userIdentitiesController from "../controllers/user-identities.controller.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";
import {
  createUserIdentitySchema,
  uuidParamSchema,
} from "../validators/index.js";

const router: IRouter = Router();

/**
 * POST /api/v1/user-identities
 * Create user identity (with optional Firebase token verification)
 */
router.post(
  "/",
  validateBody(createUserIdentitySchema),
  userIdentitiesController.createUserIdentity
);

/**
 * DELETE /api/v1/user-identities/:id
 * Delete user identity
 */
router.delete(
  "/:id",
  validateParams(uuidParamSchema),
  userIdentitiesController.deleteUserIdentity
);

export default router;

import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import { sendCreated, sendNoContent } from "../utils/api-response.js";
import { UnauthorizedError } from "../utils/http-errors.js";
import * as userIdentitiesService from "../services/user-identities.service.js";

/**
 * POST /api/v1/user-identities
 * Create user identity (with optional Firebase token verification)
 */
export const createUserIdentity = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    // If Authorization header is present, verify Firebase token
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split(" ")[1];

      // Verify token (will throw NotImplementedError if Firebase not configured)
      const decodedToken = await userIdentitiesService.verifyFirebaseToken(
        idToken
      );

      // Optional: Verify that token UID matches provider_user_id
      // You can customize this mapping based on your requirements
      if (decodedToken.uid !== req.body.provider_user_id) {
        throw new UnauthorizedError(
          "Token UID does not match provider user ID"
        );
      }
    }

    // Create identity
    const identity = await userIdentitiesService.createUserIdentity(req.body);
    sendCreated(res, identity);
  }
);

/**
 * DELETE /api/v1/user-identities/:id
 * Delete user identity
 */
export const deleteUserIdentity = asyncHandler(
  async (req: Request, res: Response) => {
    await userIdentitiesService.deleteUserIdentity(req.params.id);
    sendNoContent(res);
  }
);

import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../utils/api-response.js";
import * as usersService from "../services/users.service.js";

/**
 * POST /api/v1/users/facebook
 * Create or get user via Facebook login (idempotent)
 */
export const facebookLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await usersService.createOrGetUserViaFacebook(req.body);

    // Return 201 for new users, 200 for existing (idempotent)
    if (result.isNewUser) {
      sendCreated(res, {
        user: result.user,
        identity: result.identity,
      });
    } else {
      sendSuccess(res, {
        user: result.user,
        identity: result.identity,
      });
    }
  }
);

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getUserById(req.params.id);
  sendSuccess(res, user);
});

/**
 * GET /api/v1/users
 * Get all users with optional pagination
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const { users, total } = await usersService.getAllUsers(limit, offset);

  sendSuccess(res, users, 200, {
    pagination: {
      limit,
      offset,
      total,
    },
  });
});

/**
 * POST /api/v1/users/:id
 * Update user by ID
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateUser(req.params.id, req.body);
  sendSuccess(res, user);
});

/**
 * DELETE /api/v1/users/:id
 * Delete user by ID
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await usersService.deleteUser(req.params.id);
  sendNoContent(res);
});

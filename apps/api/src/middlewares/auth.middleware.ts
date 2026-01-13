import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { UnauthorizedError } from "../utils/http-errors.js";

/**
 * Extended Request with authenticated user ID
 */
export interface AuthRequest extends Request {
  userId: string;
}

/**
 * Middleware to verify Supabase JWT and extract user ID
 * Attaches userId to request object for downstream use
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT using Supabase Admin
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // Ensure profile exists for this auth user (idempotent)
    await ensureProfileExists(user.id, user.user_metadata?.name || "User");

    // Attach user ID to request
    (req as AuthRequest).userId = user.id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Create profile if it doesn't exist (idempotent)
 * This handles the case where Supabase Auth creates a user but profile doesn't exist yet
 */
async function ensureProfileExists(
  userId: string,
  name: string
): Promise<void> {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    // Profile doesn't exist, create it
    const { error } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      name: name,
    });

    if (error) {
      // Ignore unique constraint violations (race condition)
      if (error.code !== "23505") {
        console.error("Failed to create profile:", error);
      }
    }
  }
}

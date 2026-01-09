import { supabaseAdmin } from "../lib/supabase.js";
import {
  NotFoundError,
  InternalError,
  NotImplementedError,
} from "../utils/http-errors.js";
import { isFirebaseConfigured, verifyIdToken } from "../lib/firebase.js";
import type { UserIdentity, CreateUserIdentityData } from "@ultimate-sf/shared";

/**
 * Verify Firebase ID token (optional - only if Firebase is configured)
 */
export const verifyFirebaseToken = async (
  idToken: string
): Promise<{ uid: string; email?: string }> => {
  if (!isFirebaseConfigured()) {
    throw new NotImplementedError(
      "Firebase authentication is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  const decodedToken = await verifyIdToken(idToken);
  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
  };
};

/**
 * Create user identity for Facebook provider
 */
export const createUserIdentity = async (
  data: CreateUserIdentityData,
  provider: string = "facebook"
): Promise<UserIdentity> => {
  // Verify user exists
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", data.user_id)
    .single();

  if (userError || !user) {
    throw new NotFoundError("User not found");
  }

  // Create identity
  const { data: identity, error } = await supabaseAdmin
    .from("user_identities")
    .insert({
      user_id: data.user_id,
      provider,
      provider_user_id: data.provider_user_id,
      provider_email: data.provider_email,
    })
    .select()
    .single();

  if (error || !identity) {
    throw new InternalError("Failed to create user identity", error);
  }

  return identity as UserIdentity;
};

/**
 * Get user identity by ID
 */
export const getUserIdentityById = async (
  id: string
): Promise<UserIdentity> => {
  const { data, error } = await supabaseAdmin
    .from("user_identities")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new NotFoundError("User identity not found");
  }

  return data as UserIdentity;
};

/**
 * Delete user identity
 */
export const deleteUserIdentity = async (id: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from("user_identities")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      throw new NotFoundError("User identity not found");
    }
    throw new InternalError("Failed to delete user identity", error);
  }
};

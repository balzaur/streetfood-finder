import { supabaseAdmin } from "../lib/supabase.js";
import { NotFoundError, InternalError } from "../utils/http-errors.js";
import type {
  User,
  UserIdentity,
  FacebookLoginData,
  FacebookLoginResult,
  UpdateUserData,
} from "@ultimate-sf/shared";

/**
 * Create or get user via Facebook login (idempotent)
 */
export const createOrGetUserViaFacebook = async (
  data: FacebookLoginData
): Promise<FacebookLoginResult> => {
  // Check if identity already exists
  const { data: existingIdentity, error: identityCheckError } =
    await supabaseAdmin
      .from("user_identities")
      .select("*, users(*)")
      .eq("provider", data.provider)
      .eq("provider_user_id", data.provider_user_id)
      .single();

  if (identityCheckError && identityCheckError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new InternalError(
      "Failed to check existing identity",
      identityCheckError
    );
  }

  // If identity exists, return existing user (idempotent behavior - 200)
  if (existingIdentity) {
    return {
      user: (existingIdentity as any).users,
      identity: existingIdentity as UserIdentity,
      isNewUser: false,
    };
  }

  // Create new user
  const { data: newUser, error: userError } = await supabaseAdmin
    .from("users")
    .insert({
      name: data.name,
    })
    .select()
    .single();

  if (userError || !newUser) {
    throw new InternalError("Failed to create user", userError);
  }

  // Create user identity
  const { data: newIdentity, error: identityError } = await supabaseAdmin
    .from("user_identities")
    .insert({
      user_id: newUser.id,
      provider: data.provider,
      provider_user_id: data.provider_user_id,
      provider_email: data.provider_email,
    })
    .select()
    .single();

  if (identityError || !newIdentity) {
    // Rollback user creation if identity creation fails
    await supabaseAdmin.from("users").delete().eq("id", newUser.id);
    throw new InternalError("Failed to create user identity", identityError);
  }

  return {
    user: newUser as User,
    identity: newIdentity as UserIdentity,
    isNewUser: true,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new NotFoundError("User not found");
  }

  return data as User;
};

/**
 * Get all users with pagination
 */
export const getAllUsers = async (
  limit: number = 50,
  offset: number = 0
): Promise<{ users: User[]; total: number }> => {
  const { data, error, count } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new InternalError("Failed to fetch users", error);
  }

  return {
    users: (data || []) as User[],
    total: count || 0,
  };
};

/**
 * Update user by ID
 */
export const updateUser = async (
  id: string,
  updates: UpdateUserData
): Promise<User> => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({
      name: updates.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    if (error?.code === "PGRST116") {
      throw new NotFoundError("User not found");
    }
    throw new InternalError("Failed to update user", error);
  }

  return data as User;
};

/**
 * Delete user by ID
 * Note: Related records (business, menu, identities) will be deleted via CASCADE
 */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      throw new NotFoundError("User not found");
    }
    throw new InternalError("Failed to delete user", error);
  }
};

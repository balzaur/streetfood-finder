import { supabaseAdmin } from "../lib/supabase.js";
import { NotFoundError, InternalError } from "../utils/http-errors.js";
import type {
  Business,
  CreateBusinessData,
  UpdateBusinessData,
} from "@ultimate-sf/shared";

/**
 * Create business for a user
 */
export const createBusiness = async (
  userId: string,
  data: CreateBusinessData
): Promise<Business> => {
  // Verify user exists
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    throw new NotFoundError("User not found");
  }

  const { data: business, error } = await supabaseAdmin
    .from("business")
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description,
      image: data.image,
      longitude: data.longitude,
      latitude: data.latitude,
    })
    .select()
    .single();

  if (error || !business) {
    throw new InternalError("Failed to create business", error);
  }

  return business as Business;
};

/**
 * Get business(es) for a user
 */
export const getBusinessesByUserId = async (
  userId: string
): Promise<Business[]> => {
  const { data, error } = await supabaseAdmin
    .from("business")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new InternalError("Failed to fetch businesses", error);
  }

  return (data || []) as Business[];
};

/**
 * Get single business by ID with ownership check
 */
export const getBusinessById = async (
  businessId: string,
  userId: string
): Promise<Business> => {
  const { data, error } = await supabaseAdmin
    .from("business")
    .select("*")
    .eq("id", businessId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return 404 regardless of whether business doesn't exist or doesn't belong to user
    // This prevents leaking information about business existence
    throw new NotFoundError("Business not found");
  }

  return data as Business;
};

/**
 * Update business with ownership check
 */
export const updateBusiness = async (
  businessId: string,
  userId: string,
  updates: UpdateBusinessData
): Promise<Business> => {
  // Verify ownership
  await getBusinessById(businessId, userId);

  const { data, error } = await supabaseAdmin
    .from("business")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    throw new InternalError("Failed to update business", error);
  }

  return data as Business;
};

/**
 * Delete business with ownership check
 */
export const deleteBusiness = async (
  businessId: string,
  userId: string
): Promise<void> => {
  // Verify ownership
  await getBusinessById(businessId, userId);

  const { error } = await supabaseAdmin
    .from("business")
    .delete()
    .eq("id", businessId)
    .eq("user_id", userId);

  if (error) {
    throw new InternalError("Failed to delete business", error);
  }
};

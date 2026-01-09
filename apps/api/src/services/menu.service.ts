import { supabaseAdmin } from "../lib/supabase.js";
import { config } from "../config/env.js";
import {
  NotFoundError,
  InternalError,
  BadRequestError,
} from "../utils/http-errors.js";
import type { Menu, CreateMenuData, UpdateMenuData } from "@ultimate-sf/shared";

/**
 * Upload image to Supabase Storage
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = "menu"
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${folder}/${timestamp}-${file.originalname}`;

  const { data, error } = await supabaseAdmin.storage
    .from(config.supabase.storage.menuImagesBucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error || !data) {
    throw new InternalError("Failed to upload image", error);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from(config.supabase.storage.menuImagesBucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

/**
 * Delete image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf(
      config.supabase.storage.menuImagesBucket
    );
    if (bucketIndex === -1) return;

    const filePath = pathParts.slice(bucketIndex + 1).join("/");

    await supabaseAdmin.storage
      .from(config.supabase.storage.menuImagesBucket)
      .remove([filePath]);
  } catch (error) {
    // Best effort - don't throw if deletion fails
    console.error("Failed to delete image:", error);
  }
};

/**
 * Create menu for a business
 */
export const createMenu = async (
  businessId: string,
  data: CreateMenuData
): Promise<Menu> => {
  // Verify business exists
  const { data: business, error: businessError } = await supabaseAdmin
    .from("business")
    .select("id")
    .eq("id", businessId)
    .single();

  if (businessError || !business) {
    throw new NotFoundError("Business not found");
  }

  // Validate max 3 images
  if (data.images.length > 3) {
    throw new BadRequestError("Maximum 3 images allowed");
  }

  const { data: menu, error } = await supabaseAdmin
    .from("menu")
    .insert({
      business_id: businessId,
      menu: data.menu,
      images: data.images,
    })
    .select()
    .single();

  if (error || !menu) {
    throw new InternalError("Failed to create menu", error);
  }

  return menu as Menu;
};

/**
 * Get menu(s) for a business
 */
export const getMenusByBusinessId = async (
  businessId: string
): Promise<Menu[]> => {
  const { data, error } = await supabaseAdmin
    .from("menu")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new InternalError("Failed to fetch menus", error);
  }

  return (data || []) as Menu[];
};

/**
 * Get single menu by ID with business ownership check
 */
export const getMenuById = async (
  menuId: string,
  businessId: string
): Promise<Menu> => {
  const { data, error } = await supabaseAdmin
    .from("menu")
    .select("*")
    .eq("id", menuId)
    .eq("business_id", businessId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Menu not found");
  }

  return data as Menu;
};

/**
 * Update menu with business ownership check
 */
export const updateMenu = async (
  menuId: string,
  businessId: string,
  updates: UpdateMenuData,
  deleteOldImages: boolean = false
): Promise<Menu> => {
  // Verify ownership and get existing menu
  const existingMenu = await getMenuById(menuId, businessId);

  // If replacing images, validate count
  if (updates.images && updates.images.length > 3) {
    throw new BadRequestError("Maximum 3 images allowed");
  }

  // Delete old images if requested and new images provided
  if (deleteOldImages && updates.images && existingMenu.images.length > 0) {
    for (const imageUrl of existingMenu.images) {
      await deleteImage(imageUrl);
    }
  }

  const { data, error } = await supabaseAdmin
    .from("menu")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", menuId)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error || !data) {
    throw new InternalError("Failed to update menu", error);
  }

  return data as Menu;
};

/**
 * Delete menu with business ownership check
 */
export const deleteMenu = async (
  menuId: string,
  businessId: string
): Promise<void> => {
  // Verify ownership and get menu for image cleanup
  const menu = await getMenuById(menuId, businessId);

  // Delete associated images
  for (const imageUrl of menu.images) {
    await deleteImage(imageUrl);
  }

  const { error } = await supabaseAdmin
    .from("menu")
    .delete()
    .eq("id", menuId)
    .eq("business_id", businessId);

  if (error) {
    throw new InternalError("Failed to delete menu", error);
  }
};

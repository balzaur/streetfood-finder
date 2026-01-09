import { z } from "zod";

/**
 * UUID parameter validation
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

/**
 * User ID parameter validation
 */
export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

/**
 * Business ID parameter validation
 */
export const businessIdParamSchema = z.object({
  businessId: z.string().uuid("Invalid business ID format"),
});

/**
 * Menu ID parameter validation
 */
export const menuIdParamSchema = z.object({
  menuId: z.string().uuid("Invalid menu ID format"),
});

/**
 * Combined user + business params
 */
export const userBusinessParamsSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  businessId: z.string().uuid("Invalid business ID format"),
});

/**
 * Combined business + menu params
 */
export const businessMenuParamsSchema = z.object({
  businessId: z.string().uuid("Invalid business ID format"),
  menuId: z.string().uuid("Invalid menu ID format"),
});

/**
 * Pagination query validation
 */
export const paginationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => val > 0 && val <= 200, {
      message: "Limit must be between 1 and 200",
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, {
      message: "Offset must be non-negative",
    }),
});

/**
 * Facebook login request validation
 */
export const facebookLoginSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  provider: z.literal("facebook"),
  provider_user_id: z.string().min(1, "Provider user ID is required"),
  provider_email: z
    .string()
    .email("Invalid email format")
    .optional()
    .nullable(),
});

/**
 * Update user request validation
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});

/**
 * Coordinate validation helpers
 */
const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

/**
 * Create business request validation
 */
export const createBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(255),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().url("Invalid image URL").optional().nullable(),
  longitude: longitudeSchema,
  latitude: latitudeSchema,
});

/**
 * Update business request validation
 */
export const updateBusinessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().url("Invalid image URL").optional().nullable(),
  longitude: longitudeSchema.optional(),
  latitude: latitudeSchema.optional(),
});

/**
 * Create menu request validation (for text field only)
 * Images are validated separately in multer middleware
 */
export const createMenuSchema = z.object({
  menu: z.string().min(1, "Menu text is required"),
});

/**
 * Update menu request validation
 */
export const updateMenuSchema = z.object({
  menu: z.string().min(1, "Menu text is required").optional(),
});

/**
 * Create user identity request validation
 */
export const createUserIdentitySchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  provider_user_id: z.string().min(1, "Provider user ID is required"),
  provider_email: z
    .string()
    .email("Invalid email format")
    .optional()
    .nullable(),
});

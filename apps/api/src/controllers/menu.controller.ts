import { Request, Response, RequestHandler } from "express";
import multer from "multer";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../utils/api-response.js";
import { BadRequestError, ValidationError } from "../utils/http-errors.js";
import * as menuService from "../services/menu.service.js";

/**
 * Configure multer for file uploads (memory storage)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 3, // Max 3 files
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith("image/")) {
      cb(new BadRequestError("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

/**
 * Multer middleware for multiple image uploads
 */
export const uploadMenuImages: RequestHandler = upload.array("images", 3);

/**
 * POST /api/v1/business/:businessId/menu
 * Create menu for a business with image uploads
 */
export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const menuText = req.body.menu;

  // Validate menu text
  if (
    !menuText ||
    typeof menuText !== "string" ||
    menuText.trim().length === 0
  ) {
    throw new ValidationError("Menu text is required");
  }

  // Validate files
  if (!files || files.length === 0) {
    throw new BadRequestError("At least one image is required");
  }

  if (files.length > 3) {
    throw new BadRequestError("Maximum 3 images allowed");
  }

  // Upload images to storage
  const imageUrls: string[] = [];
  try {
    for (const file of files) {
      const url = await menuService.uploadImage(file);
      imageUrls.push(url);
    }

    // Create menu record
    const menu = await menuService.createMenu(req.params.businessId, {
      menu: menuText,
      images: imageUrls,
    });

    sendCreated(res, menu);
  } catch (error) {
    // Cleanup uploaded images if menu creation fails
    for (const url of imageUrls) {
      await menuService.deleteImage(url);
    }
    throw error;
  }
});

/**
 * GET /api/v1/business/:businessId/menu
 * Get menu(s) for a business
 */
export const getMenus = asyncHandler(async (req: Request, res: Response) => {
  const menus = await menuService.getMenusByBusinessId(req.params.businessId);
  sendSuccess(res, menus);
});

/**
 * POST /api/v1/business/:businessId/menu/:menuId
 * Update menu for a business (optionally with new images)
 */
export const updateMenu = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const menuText = req.body.menu;

  const updates: { menu?: string; images?: string[] } = {};

  // Update menu text if provided
  if (menuText && typeof menuText === "string" && menuText.trim().length > 0) {
    updates.menu = menuText;
  }

  // Upload new images if provided
  if (files && files.length > 0) {
    if (files.length > 3) {
      throw new BadRequestError("Maximum 3 images allowed");
    }

    const imageUrls: string[] = [];
    try {
      for (const file of files) {
        const url = await menuService.uploadImage(file);
        imageUrls.push(url);
      }
      updates.images = imageUrls;
    } catch (error) {
      // Cleanup uploaded images if upload fails
      for (const url of imageUrls) {
        await menuService.deleteImage(url);
      }
      throw error;
    }
  }

  // Require at least one update
  if (Object.keys(updates).length === 0) {
    throw new BadRequestError("No updates provided");
  }

  // Update menu (delete old images if new ones are provided)
  const menu = await menuService.updateMenu(
    req.params.menuId,
    req.params.businessId,
    updates,
    !!updates.images // Delete old images only if new ones are uploaded
  );

  sendSuccess(res, menu);
});

/**
 * DELETE /api/v1/business/:businessId/menu/:menuId
 * Delete menu for a business
 */
export const deleteMenu = asyncHandler(async (req: Request, res: Response) => {
  await menuService.deleteMenu(req.params.menuId, req.params.businessId);
  sendNoContent(res);
});

import { Request, Response } from "express";
import * as vendorService from "../services/vendor.service.js";

export const getAllVendors = (_req: Request, res: Response) => {
  try {
    const vendors = vendorService.getAllVendors();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch vendors",
    });
  }
};

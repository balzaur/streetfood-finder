import { Router, IRouter } from "express";
import healthRoutes from "./health.routes.js";
import vendorRoutes from "./vendor.routes.js";
import businessRoutes from "./business.routes.js";
import menuRoutes from "./menu.routes.js";

const router: IRouter = Router();

// Mount routes
router.use("/health", healthRoutes);
router.use("/api/v1/vendors", vendorRoutes);
router.use("/api/v1/business", businessRoutes);
router.use("/api/v1/business", menuRoutes);

export default router;

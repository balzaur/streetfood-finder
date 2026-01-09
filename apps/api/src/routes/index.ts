import { Router, IRouter } from "express";
import healthRoutes from "./health.routes.js";
import vendorRoutes from "./vendor.routes.js";
import usersRoutes from "./users.routes.js";
import businessRoutes from "./business.routes.js";
import menuRoutes from "./menu.routes.js";
import userIdentitiesRoutes from "./user-identities.routes.js";

const router: IRouter = Router();

// Mount routes
router.use("/health", healthRoutes);
router.use("/api/v1/vendors", vendorRoutes);
router.use("/api/v1/users", usersRoutes);
router.use("/api/v1/users", businessRoutes);
router.use("/api/v1/business", menuRoutes);
router.use("/api/v1/user-identities", userIdentitiesRoutes);

export default router;

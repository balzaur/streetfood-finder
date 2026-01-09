import { Router, IRouter } from "express";
import * as vendorController from "../controllers/vendor.controller.js";

const router: IRouter = Router();

router.get("/", vendorController.getAllVendors);

export default router;

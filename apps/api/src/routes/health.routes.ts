import { Router, IRouter } from "express";
import * as healthController from "../controllers/health.controller.js";

const router: IRouter = Router();

router.get("/", healthController.getHealth);

export default router;

import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { initializeFirebase } from "./lib/firebase.js";

const app: Application = express();

// Initialize Firebase (optional)
initializeFirebase();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({ origin: config.corsOrigin }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all routes
app.use("/", routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;

import app from "./app.js";
import { config } from "./config/env.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log("");
  console.log("🍜 Ultimate Street Food Finder API");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log("");
  console.log("Available endpoints:");
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/api/v1/vendors`);
  console.log("");
});

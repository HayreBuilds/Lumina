import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

import pipelineRoutes from "./routes/pipeline";
import ingestRoutes from "./routes/ingest";
import biologyRoutes from "./routes/biology";
import visionRoutes from "./routes/vision";
import reasoningRoutes from "./routes/reasoning";
import safetyRoutes from "./routes/safety";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001");
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*", credentials: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

// Routes
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/biology", biologyRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/reasoning", reasoningRoutes);
app.use("/api/safety", safetyRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "LUMINA API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      nvidia_key_configured: !!process.env.NVIDIA_API_KEY,
    },
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🧬 LUMINA API Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   NVIDIA Key: ${process.env.NVIDIA_API_KEY ? "✓ Configured" : "✗ Missing"}\n`);
});

export default app;

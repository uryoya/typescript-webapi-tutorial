import express from "express";
import type { ErrorRequestHandler, RequestHandler } from "express";

const app = express();

// Middleware
app.use(express.json());

// CORS (Allow all origins for development)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Request logging middleware
const requestLogger: RequestHandler = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
app.use(requestLogger);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
import todoRoutes from "./routes/todos.js";
app.use("/api", todoRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
app.use(errorHandler);

export { app };

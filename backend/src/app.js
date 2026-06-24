const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const groupRoutes = require("./routes/groups");
const whatsappRoutes = require("./routes/whatsapp");
const env = require("./config/env");
const { prisma } = require("./db");

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
}, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));
app.use("/v1", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/ready", async (_req, res, next) => {
  try { await prisma.$queryRawUnsafe("SELECT 1"); return res.json({ status: "ready" }); } catch (error) { return next(error); }
});
app.use("/v1/auth", authRoutes);
app.use("/v1/events", eventRoutes);
app.use("/v1/groups", groupRoutes);
app.use("/v1/whatsapp", whatsappRoutes);
app.use((err, _req, res, _next) => {
  if (err.name === "ZodError") return res.status(400).json({ error: "VALIDATION_ERROR", details: err.flatten() });
  if (err.code === "P2002") return res.status(409).json({ error: "RESOURCE_ALREADY_EXISTS" });
  if (["INVALID_REFRESH_TOKEN", "INVALID_OR_EXPIRED_OTP", "OTP_DELIVERY_FAILED"].includes(err.message)) return res.status(401).json({ error: err.message });
  console.error(err);
  return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
});

module.exports = { app };

import rateLimit from "express-rate-limit";
import { redisRateLimitStore } from "../configs/redisRateLimitStore.js";
import { env } from "../configs/env.js";
import { logger } from "../configs/logger.js";

export const rateLimiter = rateLimit({
  store: redisRateLimitStore,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.get("user-agent"),
      },
      "Rate limit exceeded",
    );

    res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  },
  skip: (req) => req.path === "/health" || req.path.startsWith("/admin/queues"),
});

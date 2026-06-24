const { z } = require("zod");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_PEPPER: z.string().min(32),
  OTP_PEPPER: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  OTP_TTL_MINUTES: z.coerce.number().int().min(1).max(30).default(10),
  SMS_PROVIDER: z.enum(["console", "africas_talking"]).default("console"),
  AFRICASTALKING_USERNAME: z.string().optional(),
  AFRICASTALKING_API_KEY: z.string().optional(),
  AFRICASTALKING_SENDER_ID: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:8081"),
  WHATSAPP_VERIFY_TOKEN: z.string().min(16).optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
if (parsed.data.NODE_ENV === "production" && parsed.data.SMS_PROVIDER === "console") {
  console.error("SMS_PROVIDER=console is not allowed in production");
  process.exit(1);
}

module.exports = parsed.data;

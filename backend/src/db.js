const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const env = require("./config/env");

// Decode credentials explicitly. This avoids pooler connection-string parsing
// issues when a secure database password contains URL-reserved characters.
const databaseUrl = new URL(env.DATABASE_URL);
const adapter = new PrismaPg({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  database: databaseUrl.pathname.slice(1),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  // Supabase pooler encrypts the connection but presents a chain that is not
  // trusted by every local Node installation. Pin Supabase's CA in production.
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = { prisma };

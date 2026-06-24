const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { prisma } = require("../db");

const hash = (value, pepper) => crypto.createHmac("sha256", pepper).update(value).digest("hex");
const randomToken = () => crypto.randomBytes(48).toString("base64url");

function publicUser(user) {
  return { id: user.id, name: user.name, phoneNumber: user.phoneNumber, phoneVerifiedAt: user.phoneVerifiedAt };
}

function issueAccessToken(user) {
  return jwt.sign({ sub: user.id, phoneNumber: user.phoneNumber }, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
}

async function createSession(user, metadata = {}) {
  const refreshToken = randomToken();
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000);
  await prisma.refreshToken.create({ data: {
    userId: user.id, tokenHash: hash(refreshToken, env.REFRESH_TOKEN_PEPPER), expiresAt,
    userAgent: metadata.userAgent?.slice(0, 500), ipAddress: metadata.ipAddress?.slice(0, 64),
  } });
  return { accessToken: issueAccessToken(user), refreshToken, refreshTokenExpiresAt: expiresAt, user: publicUser(user) };
}

async function rotateSession(refreshToken, metadata = {}) {
  const tokenHash = hash(refreshToken, env.REFRESH_TOKEN_PEPPER);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) throw new Error("INVALID_REFRESH_TOKEN");
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  return createSession(stored.user, metadata);
}

async function revokeSession(refreshToken) {
  return prisma.refreshToken.updateMany({ where: { tokenHash: hash(refreshToken, env.REFRESH_TOKEN_PEPPER), revokedAt: null }, data: { revokedAt: new Date() } });
}

async function revokeAllSessions(userId) {
  return prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

module.exports = { createSession, rotateSession, revokeSession, revokeAllSessions, publicUser, hash };

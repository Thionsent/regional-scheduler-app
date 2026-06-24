const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { prisma } = require("../db");
const { asyncHandler } = require("../utils/async-handler");
const { createSession, rotateSession, revokeSession, revokeAllSessions } = require("../services/session");
const { issueOtp, consumeOtp } = require("../services/otp");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const phone = z.string().trim().min(7).max(20);
const password = z.string().min(8).max(128);
const metadata = (req) => ({ userAgent: req.get("user-agent"), ipAddress: req.ip });

router.post("/register", asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(2).max(100), phoneNumber: phone, password }).parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: { name: input.name, phoneNumber: input.phoneNumber, passwordHash } });
  res.status(201).json(await createSession(user, metadata(req)));
}));

router.post("/login", asyncHandler(async (req, res) => {
  const input = z.object({ phoneNumber: phone, password }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });
  if (!user?.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  return res.json(await createSession(user, metadata(req)));
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const input = z.object({ refreshToken: z.string().min(32) }).parse(req.body);
  res.json(await rotateSession(input.refreshToken, metadata(req)));
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const input = z.object({ refreshToken: z.string().min(32) }).parse(req.body);
  await revokeSession(input.refreshToken);
  res.status(204).end();
}));

router.post("/otp/request", asyncHandler(async (req, res) => {
  const input = z.object({ phoneNumber: phone, purpose: z.enum(["SIGN_IN", "PHONE_VERIFICATION"]).default("SIGN_IN") }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });
  await issueOtp({ userId: user?.id, phoneNumber: input.phoneNumber, purpose: input.purpose });
  res.status(202).json({ data: { accepted: true } });
}));

router.post("/otp/verify", asyncHandler(async (req, res) => {
  const input = z.object({ phoneNumber: phone, code: z.string().regex(/^\d{6}$/), name: z.string().trim().min(2).max(100).optional() }).parse(req.body);
  await consumeOtp({ phoneNumber: input.phoneNumber, purpose: "SIGN_IN", code: input.code });
  const user = await prisma.user.upsert({ where: { phoneNumber: input.phoneNumber }, update: { phoneVerifiedAt: new Date() }, create: { phoneNumber: input.phoneNumber, name: input.name || "Scheduler user", phoneVerifiedAt: new Date() } });
  res.json(await createSession(user, metadata(req)));
}));

router.post("/password-reset/request", asyncHandler(async (req, res) => {
  const input = z.object({ phoneNumber: phone }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });
  if (user) await issueOtp({ userId: user.id, phoneNumber: input.phoneNumber, purpose: "PASSWORD_RESET" });
  res.status(202).json({ data: { accepted: true } });
}));

router.post("/password-reset/confirm", asyncHandler(async (req, res) => {
  const input = z.object({ phoneNumber: phone, code: z.string().regex(/^\d{6}$/), newPassword: password }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });
  if (!user) return res.status(400).json({ error: "INVALID_OR_EXPIRED_OTP" });
  await consumeOtp({ phoneNumber: input.phoneNumber, purpose: "PASSWORD_RESET", code: input.code });
  await prisma.$transaction([prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } }), prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
  res.status(204).end();
}));

router.post("/logout-all", requireAuth, asyncHandler(async (req, res) => {
  await revokeAllSessions(req.auth.sub);
  res.status(204).end();
}));

module.exports = router;

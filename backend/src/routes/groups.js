const express = require("express");
const { z } = require("zod");
const { prisma } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();
router.use(requireAuth);
router.get("/", asyncHandler(async (req, res) => {
  const groups = await prisma.group.findMany({ where: { members: { some: { userId: req.auth.sub } } }, include: { _count: { select: { members: true } } } });
  res.json({ data: groups });
}));
router.post("/", asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(1000).optional(), targetAmount: z.coerce.number().nonnegative().optional(), deadline: z.coerce.date().optional() }).parse(req.body);
  const group = await prisma.group.create({ data: { ...input, members: { create: { userId: req.auth.sub, role: "OWNER" } } } });
  res.status(201).json({ data: group });
}));
router.get("/feed", asyncHandler(async (req, res) => {
  const [groups, invitations] = await Promise.all([
    prisma.group.findMany({ where: { members: { some: { userId: req.auth.sub } } }, include: { _count: { select: { members: true } } } }),
    prisma.invitation.findMany({ where: { invitedUserId: req.auth.sub, status: "PENDING" }, include: { group: true, event: true }, orderBy: { createdAt: "desc" } }),
  ]);
  res.json({ data: { groups, invitations } });
}));
router.post("/:groupId/invitations", asyncHandler(async (req, res) => {
  const input = z.object({ invitedPhone: z.string().min(7).max(20), eventId: z.string().uuid().optional() }).parse(req.body);
  const membership = await prisma.groupMember.findFirst({ where: { groupId: req.params.groupId, userId: req.auth.sub, role: { in: ["OWNER", "ADMIN"] } } });
  if (!membership) return res.status(403).json({ error: "GROUP_ADMIN_REQUIRED" });
  const invitedUser = await prisma.user.findUnique({ where: { phoneNumber: input.invitedPhone } });
  const invitation = await prisma.invitation.create({ data: { groupId: req.params.groupId, eventId: input.eventId, invitedPhone: input.invitedPhone, invitedUserId: invitedUser?.id } });
  res.status(201).json({ data: invitation });
}));
router.post("/invitations/:invitationId/rsvp", asyncHandler(async (req, res) => {
  const input = z.object({ response: z.enum(["ACCEPTED", "DECLINED"]) }).parse(req.body);
  const invitation = await prisma.invitation.findFirst({ where: { id: req.params.invitationId, invitedUserId: req.auth.sub, status: "PENDING" } });
  if (!invitation) return res.status(404).json({ error: "INVITATION_NOT_FOUND" });
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.invitation.update({ where: { id: invitation.id }, data: { status: input.response, respondedAt: new Date() } });
    if (input.response === "ACCEPTED") await tx.groupMember.upsert({ where: { groupId_userId: { groupId: invitation.groupId, userId: req.auth.sub } }, update: {}, create: { groupId: invitation.groupId, userId: req.auth.sub } });
    return result;
  });
  res.json({ data: updated });
}));

module.exports = router;

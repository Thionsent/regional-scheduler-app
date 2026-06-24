const express = require("express");
const { z } = require("zod");
const { prisma } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/async-handler");
const { writeAudit } = require("../services/audit");

const router = express.Router();
const eventSchema = z.object({
  title: z.string().trim().min(1).max(200), description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(300).optional(), startTime: z.coerce.date(), endTime: z.coerce.date(),
  timezone: z.string().trim().min(1).max(100).default("Africa/Nairobi"), groupId: z.string().uuid().optional(),
}).refine((event) => event.endTime > event.startTime, { message: "endTime must be after startTime", path: ["endTime"] });

router.use(requireAuth);
router.get("/", asyncHandler(async (req, res) => {
  const query = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), q: z.string().trim().max(100).optional() }).parse(req.query);
  const events = await prisma.event.findMany({
    where: { userId: req.auth.sub, status: { not: "CANCELLED" }, startTime: { gte: query.from, lte: query.to }, title: query.q ? { contains: query.q, mode: "insensitive" } : undefined },
    orderBy: { startTime: "asc" },
  });
  res.json({ data: events });
}));
router.post("/", asyncHandler(async (req, res) => {
  const input = eventSchema.parse(req.body);
  const event = await prisma.event.create({ data: { ...input, userId: req.auth.sub, source: "APP" } });
  await writeAudit({ userId: req.auth.sub, eventId: event.id, action: "EVENT_CREATED", source: "APP", payload: input });
  res.status(201).json({ data: event });
}));
router.patch("/:eventId", asyncHandler(async (req, res) => {
  const input = eventSchema.partial().parse(req.body);
  const event = await prisma.event.updateMany({ where: { id: req.params.eventId, userId: req.auth.sub }, data: input });
  if (!event.count) return res.status(404).json({ error: "EVENT_NOT_FOUND" });
  res.status(204).end();
}));
router.delete("/:eventId", asyncHandler(async (req, res) => {
  const event = await prisma.event.updateMany({ where: { id: req.params.eventId, userId: req.auth.sub }, data: { status: "CANCELLED" } });
  if (!event.count) return res.status(404).json({ error: "EVENT_NOT_FOUND" });
  res.status(204).end();
}));

module.exports = router;

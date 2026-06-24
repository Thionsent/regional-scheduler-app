const express = require("express");
const { z } = require("zod");
const env = require("../config/env");
const { prisma } = require("../db");
const { parseNaturalLanguageSchedule } = require("../services/schedule-parser");
const { writeAudit } = require("../services/audit");
const { asyncHandler } = require("../utils/async-handler");

const router = express.Router();
router.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === env.WHATSAPP_VERIFY_TOKEN) return res.status(200).send(req.query["hub.challenge"]);
  return res.sendStatus(403);
});
router.post("/webhook", asyncHandler(async (req, res) => {
  // Provider adapters (Meta, Twilio, Africa's Talking) should normalize their webhook here.
  const input = z.object({ phoneNumber: z.string().min(7), message: z.string().min(1).max(4000), messageId: z.string().min(1).optional() }).parse(req.body);
  const user = await prisma.user.upsert({ where: { phoneNumber: input.phoneNumber }, update: {}, create: { phoneNumber: input.phoneNumber, name: "WhatsApp user" } });
  const parsed = parseNaturalLanguageSchedule(input.message);
  const event = await prisma.event.create({ data: { userId: user.id, title: parsed.title, startTime: parsed.startTime, endTime: parsed.endTime, source: "WHATSAPP", externalId: input.messageId } });
  await writeAudit({ userId: user.id, eventId: event.id, action: "WHATSAPP_SCHEDULE_PARSED", source: "WHATSAPP", payload: { message: input.message, confidence: parsed.confidence } });
  res.status(201).json({ data: { event, confidence: parsed.confidence, reply: `Scheduled ${event.title} for ${event.startTime.toISOString()}.` } });
}));

module.exports = router;

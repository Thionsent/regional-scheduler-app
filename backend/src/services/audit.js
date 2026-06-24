const { prisma } = require("../db");

async function writeAudit({ userId, eventId, action, source, payload }) {
  return prisma.auditLog.create({ data: { userId, eventId, action, source, payload } });
}

module.exports = { writeAudit };

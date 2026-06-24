require("dotenv").config();
const env = require("./config/env");
const { app } = require("./app");
const { prisma } = require("./db");

const server = app.listen(env.PORT, () => console.log(`Regional Scheduler API listening on :${env.PORT}`));
const shutdown = () => server.close(async () => { await prisma.$disconnect(); process.exit(0); });
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

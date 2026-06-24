const crypto = require("crypto");
const env = require("../config/env");
const { prisma } = require("../db");
const { hash } = require("./session");

const createCode = () => crypto.randomInt(100000, 1000000).toString();

async function deliverOtp(phoneNumber, code, purpose) {
  const message = `Regional Scheduler verification code: ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes.`;
  if (env.SMS_PROVIDER === "console") {
    console.info(`[DEV OTP] ${purpose} for ${phoneNumber}: ${code}`);
    return;
  }
  const response = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded",
      apiKey: env.AFRICASTALKING_API_KEY,
    },
    body: new URLSearchParams({ username: env.AFRICASTALKING_USERNAME, to: phoneNumber, message, ...(env.AFRICASTALKING_SENDER_ID ? { from: env.AFRICASTALKING_SENDER_ID } : {}) }),
  });
  if (!response.ok) throw new Error("OTP_DELIVERY_FAILED");
}

async function issueOtp({ userId, phoneNumber, purpose }) {
  const code = createCode();
  await prisma.$transaction([
    prisma.otpChallenge.updateMany({ where: { phoneNumber, purpose, consumedAt: null }, data: { consumedAt: new Date() } }),
    prisma.otpChallenge.create({ data: { userId, phoneNumber, purpose, codeHash: hash(code, env.OTP_PEPPER), expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000) } }),
  ]);
  await deliverOtp(phoneNumber, code, purpose);
}

async function consumeOtp({ phoneNumber, purpose, code }) {
  const challenge = await prisma.otpChallenge.findFirst({ where: { phoneNumber, purpose, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!challenge || challenge.attempts >= 5 || hash(code, env.OTP_PEPPER) !== challenge.codeHash) {
    if (challenge) await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    throw new Error("INVALID_OR_EXPIRED_OTP");
  }
  await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
  return challenge;
}

module.exports = { issueOtp, consumeOtp };

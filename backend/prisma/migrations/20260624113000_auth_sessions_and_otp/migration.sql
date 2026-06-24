CREATE TYPE "scheduler_otp_purpose" AS ENUM ('SIGN_IN', 'PHONE_VERIFICATION', 'PASSWORD_RESET');

ALTER TABLE "scheduler_users" ADD COLUMN "phone_verified_at" TIMESTAMP(3);

CREATE TABLE "scheduler_refresh_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "user_agent" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "scheduler_refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scheduler_otp_challenges" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "phone_number" TEXT NOT NULL,
  "purpose" "scheduler_otp_purpose" NOT NULL,
  "code_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "scheduler_otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scheduler_refresh_tokens_token_hash_key" ON "scheduler_refresh_tokens"("token_hash");
CREATE INDEX "scheduler_refresh_tokens_user_id_expires_at_idx" ON "scheduler_refresh_tokens"("user_id", "expires_at");
CREATE INDEX "scheduler_otp_challenges_phone_number_purpose_expires_at_idx" ON "scheduler_otp_challenges"("phone_number", "purpose", "expires_at");

ALTER TABLE "scheduler_refresh_tokens" ADD CONSTRAINT "scheduler_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "scheduler_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_otp_challenges" ADD CONSTRAINT "scheduler_otp_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "scheduler_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

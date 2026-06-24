-- The legacy prototype uses unprefixed tables (events, Event, User, chama_groups).
-- Keep those intact while the production API owns this isolated scheduler_* namespace.
CREATE TYPE "scheduler_group_role" AS ENUM ('MEMBER', 'ADMIN', 'OWNER');
CREATE TYPE "scheduler_event_status" AS ENUM ('CONFIRMED', 'PENDING', 'CANCELLED');
CREATE TYPE "scheduler_event_source" AS ENUM ('APP', 'WHATSAPP', 'API');
CREATE TYPE "scheduler_invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

CREATE TABLE "scheduler_users" (
  "id" UUID NOT NULL, "phone_number" TEXT NOT NULL, "email" TEXT, "name" TEXT NOT NULL,
  "password_hash" TEXT, "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scheduler_users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "scheduler_groups" (
  "id" UUID NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "target_amount" DECIMAL(14,2),
  "current_amount" DECIMAL(14,2) NOT NULL DEFAULT 0, "deadline" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scheduler_groups_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "scheduler_events" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "group_id" UUID, "title" TEXT NOT NULL,
  "description" TEXT, "location" TEXT, "start_time" TIMESTAMP(3) NOT NULL, "end_time" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi', "status" "scheduler_event_status" NOT NULL DEFAULT 'CONFIRMED',
  "source" "scheduler_event_source" NOT NULL DEFAULT 'APP', "external_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scheduler_events_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "scheduler_group_members" (
  "id" UUID NOT NULL, "group_id" UUID NOT NULL, "user_id" UUID NOT NULL,
  "role" "scheduler_group_role" NOT NULL DEFAULT 'MEMBER', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "scheduler_group_members_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "scheduler_invitations" (
  "id" UUID NOT NULL, "group_id" UUID NOT NULL, "event_id" UUID, "invited_user_id" UUID,
  "invited_phone" TEXT, "status" "scheduler_invitation_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "responded_at" TIMESTAMP(3),
  CONSTRAINT "scheduler_invitations_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "scheduler_audit_logs" (
  "id" UUID NOT NULL, "user_id" UUID, "event_id" UUID, "action" TEXT NOT NULL,
  "source" "scheduler_event_source" NOT NULL, "payload" JSONB, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "scheduler_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scheduler_users_phone_number_key" ON "scheduler_users"("phone_number");
CREATE UNIQUE INDEX "scheduler_users_email_key" ON "scheduler_users"("email");
CREATE UNIQUE INDEX "scheduler_events_external_id_key" ON "scheduler_events"("external_id");
CREATE INDEX "scheduler_events_user_id_start_time_idx" ON "scheduler_events"("user_id", "start_time");
CREATE INDEX "scheduler_events_group_id_start_time_idx" ON "scheduler_events"("group_id", "start_time");
CREATE INDEX "scheduler_group_members_user_id_idx" ON "scheduler_group_members"("user_id");
CREATE UNIQUE INDEX "scheduler_group_members_group_id_user_id_key" ON "scheduler_group_members"("group_id", "user_id");
CREATE INDEX "scheduler_invitations_invited_user_id_status_idx" ON "scheduler_invitations"("invited_user_id", "status");
CREATE INDEX "scheduler_invitations_invited_phone_status_idx" ON "scheduler_invitations"("invited_phone", "status");
CREATE INDEX "scheduler_audit_logs_user_id_created_at_idx" ON "scheduler_audit_logs"("user_id", "created_at");

ALTER TABLE "scheduler_events" ADD CONSTRAINT "scheduler_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "scheduler_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_events" ADD CONSTRAINT "scheduler_events_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scheduler_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scheduler_group_members" ADD CONSTRAINT "scheduler_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scheduler_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_group_members" ADD CONSTRAINT "scheduler_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "scheduler_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_invitations" ADD CONSTRAINT "scheduler_invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scheduler_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_invitations" ADD CONSTRAINT "scheduler_invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "scheduler_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scheduler_invitations" ADD CONSTRAINT "scheduler_invitations_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "scheduler_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scheduler_audit_logs" ADD CONSTRAINT "scheduler_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "scheduler_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scheduler_audit_logs" ADD CONSTRAINT "scheduler_audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "scheduler_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

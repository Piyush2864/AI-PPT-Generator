-- CreateEnum
CREATE TYPE "PresentationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PresentationTheme" AS ENUM ('MINIMAL', 'CORPORATE', 'CREATIVE', 'DARK', 'ACADEMIC');

-- CreateEnum
CREATE TYPE "PresentationTone" AS ENUM ('FORMAL', 'CASUAL', 'INFORMATIVE', 'PERSUASIVE');

-- CreateEnum
CREATE TYPE "PresentationStyle" AS ENUM ('MINIMAL', 'PROFESSIONAL', 'CREATIVE', 'BOLD');

-- CreateEnum
CREATE TYPE "JobEventType" AS ENUM ('CREATED', 'STARTED', 'RETRY', 'FAILED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "slide_count" INTEGER NOT NULL,
    "theme" "PresentationTheme" NOT NULL DEFAULT 'MINIMAL',
    "tone" "PresentationTone" NOT NULL DEFAULT 'INFORMATIVE',
    "style" "PresentationStyle" NOT NULL DEFAULT 'PROFESSIONAL',
    "custom_instructions" TEXT,
    "status" "PresentationStatus" NOT NULL DEFAULT 'PENDING',
    "failure_reason" TEXT,
    "job_id" TEXT,
    "pdf_url" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slides" (
    "id" TEXT NOT NULL,
    "presentation_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "presentation_id" TEXT NOT NULL,
    "event_type" "JobEventType" NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "presentations_user_id_idx" ON "presentations"("user_id");

-- CreateIndex
CREATE INDEX "presentations_status_idx" ON "presentations"("status");

-- CreateIndex
CREATE INDEX "slides_presentation_id_idx" ON "slides"("presentation_id");

-- CreateIndex
CREATE UNIQUE INDEX "slides_presentation_id_order_key" ON "slides"("presentation_id", "order");

-- CreateIndex
CREATE INDEX "job_logs_presentation_id_idx" ON "job_logs"("presentation_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slides" ADD CONSTRAINT "slides_presentation_id_fkey" FOREIGN KEY ("presentation_id") REFERENCES "presentations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_logs" ADD CONSTRAINT "job_logs_presentation_id_fkey" FOREIGN KEY ("presentation_id") REFERENCES "presentations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

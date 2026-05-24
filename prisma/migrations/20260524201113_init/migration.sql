-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('subscriber', 'admin');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'inactive', 'cancelled', 'past_due', 'trialing');

-- CreateEnum
CREATE TYPE "DrawMode" AS ENUM ('random', 'algorithmic');

-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('pending', 'simulated', 'completed', 'published');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'verified', 'paid', 'rejected');

-- CreateEnum
CREATE TYPE "ProofReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('draw_result', 'winner_alert', 'subscription_update', 'payout_update');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'subscriber',
    "charity_percentage" INTEGER NOT NULL DEFAULT 10,
    "selected_charity_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'monthly',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'inactive',
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golf_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "score_date" DATE NOT NULL,
    "entry_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "golf_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_events" (
    "id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_contributions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "amount_pence" INTEGER NOT NULL,
    "billing_period" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charity_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draws" (
    "id" TEXT NOT NULL,
    "month_key" TEXT NOT NULL,
    "status" "DrawStatus" NOT NULL DEFAULT 'pending',
    "draw_mode" "DrawMode" NOT NULL DEFAULT 'random',
    "jackpot_carryover" INTEGER NOT NULL DEFAULT 0,
    "drawn_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_results" (
    "id" TEXT NOT NULL,
    "draw_id" TEXT NOT NULL,
    "number_1" INTEGER NOT NULL,
    "number_2" INTEGER NOT NULL,
    "number_3" INTEGER NOT NULL,
    "number_4" INTEGER NOT NULL,
    "number_5" INTEGER NOT NULL,
    "is_simulation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draw_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_pools" (
    "id" TEXT NOT NULL,
    "draw_id" TEXT NOT NULL,
    "total_pence" INTEGER NOT NULL,
    "tier_5_pence" INTEGER NOT NULL,
    "tier_4_pence" INTEGER NOT NULL,
    "tier_3_pence" INTEGER NOT NULL,
    "jackpot_carryover" INTEGER NOT NULL DEFAULT 0,
    "active_subscribers" INTEGER NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prize_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draw_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "draw_id" TEXT NOT NULL,
    "score_1" INTEGER NOT NULL,
    "score_2" INTEGER NOT NULL,
    "score_3" INTEGER NOT NULL,
    "score_4" INTEGER NOT NULL,
    "score_5" INTEGER NOT NULL,
    "match_count" INTEGER NOT NULL DEFAULT 0,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "draw_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "draw_id" TEXT NOT NULL,
    "match_tier" INTEGER NOT NULL,
    "prize_amount_pence" INTEGER NOT NULL,
    "payout_status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winner_proofs" (
    "id" TEXT NOT NULL,
    "winner_id" TEXT NOT NULL,
    "proof_url" TEXT NOT NULL,
    "review_status" "ProofReviewStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "winner_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "target_id" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_supabase_id_idx" ON "users"("supabase_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "golf_scores_user_id_entry_order_idx" ON "golf_scores"("user_id", "entry_order");

-- CreateIndex
CREATE INDEX "golf_scores_user_id_score_date_idx" ON "golf_scores"("user_id", "score_date");

-- CreateIndex
CREATE UNIQUE INDEX "golf_scores_user_id_score_date_key" ON "golf_scores"("user_id", "score_date");

-- CreateIndex
CREATE UNIQUE INDEX "charities_slug_key" ON "charities"("slug");

-- CreateIndex
CREATE INDEX "charities_slug_idx" ON "charities"("slug");

-- CreateIndex
CREATE INDEX "charities_is_featured_is_active_idx" ON "charities"("is_featured", "is_active");

-- CreateIndex
CREATE INDEX "charity_events_charity_id_event_date_idx" ON "charity_events"("charity_id", "event_date");

-- CreateIndex
CREATE INDEX "charity_contributions_user_id_idx" ON "charity_contributions"("user_id");

-- CreateIndex
CREATE INDEX "charity_contributions_charity_id_idx" ON "charity_contributions"("charity_id");

-- CreateIndex
CREATE INDEX "charity_contributions_billing_period_idx" ON "charity_contributions"("billing_period");

-- CreateIndex
CREATE UNIQUE INDEX "draws_month_key_key" ON "draws"("month_key");

-- CreateIndex
CREATE INDEX "draws_status_idx" ON "draws"("status");

-- CreateIndex
CREATE INDEX "draws_month_key_idx" ON "draws"("month_key");

-- CreateIndex
CREATE UNIQUE INDEX "draw_results_draw_id_key" ON "draw_results"("draw_id");

-- CreateIndex
CREATE UNIQUE INDEX "prize_pools_draw_id_key" ON "prize_pools"("draw_id");

-- CreateIndex
CREATE INDEX "draw_entries_draw_id_match_count_idx" ON "draw_entries"("draw_id", "match_count");

-- CreateIndex
CREATE UNIQUE INDEX "draw_entries_user_id_draw_id_key" ON "draw_entries"("user_id", "draw_id");

-- CreateIndex
CREATE INDEX "winners_payout_status_idx" ON "winners"("payout_status");

-- CreateIndex
CREATE INDEX "winners_draw_id_idx" ON "winners"("draw_id");

-- CreateIndex
CREATE UNIQUE INDEX "winners_user_id_draw_id_key" ON "winners"("user_id", "draw_id");

-- CreateIndex
CREATE INDEX "winner_proofs_winner_id_idx" ON "winner_proofs"("winner_id");

-- CreateIndex
CREATE INDEX "winner_proofs_review_status_idx" ON "winner_proofs"("review_status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "admin_audit_logs_admin_id_idx" ON "admin_audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_selected_charity_id_fkey" FOREIGN KEY ("selected_charity_id") REFERENCES "charities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "golf_scores" ADD CONSTRAINT "golf_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charity_events" ADD CONSTRAINT "charity_events_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charity_contributions" ADD CONSTRAINT "charity_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charity_contributions" ADD CONSTRAINT "charity_contributions_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_results" ADD CONSTRAINT "draw_results_draw_id_fkey" FOREIGN KEY ("draw_id") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_pools" ADD CONSTRAINT "prize_pools_draw_id_fkey" FOREIGN KEY ("draw_id") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_entries" ADD CONSTRAINT "draw_entries_draw_id_fkey" FOREIGN KEY ("draw_id") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_draw_id_fkey" FOREIGN KEY ("draw_id") REFERENCES "draws"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winner_proofs" ADD CONSTRAINT "winner_proofs_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "winners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

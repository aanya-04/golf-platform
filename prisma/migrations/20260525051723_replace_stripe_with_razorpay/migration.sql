/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_price_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `trial_end` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpay_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "golf_scores_user_id_score_date_idx";

-- DropIndex
DROP INDEX "subscriptions_stripe_customer_id_idx";

-- DropIndex
DROP INDEX "subscriptions_stripe_customer_id_key";

-- DropIndex
DROP INDEX "subscriptions_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_price_id",
DROP COLUMN "stripe_subscription_id",
DROP COLUMN "trial_end",
ADD COLUMN     "razorpay_customer_id" TEXT,
ADD COLUMN     "razorpay_plan_id" TEXT,
ADD COLUMN     "razorpay_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpay_subscription_id_key" ON "subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_razorpay_customer_id_idx" ON "subscriptions"("razorpay_customer_id");

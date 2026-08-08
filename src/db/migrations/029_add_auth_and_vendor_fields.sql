-- Migration 029: Add auth and vendor fields
ALTER TABLE `organizations` 
  ADD COLUMN `gst_no` VARCHAR(50) NULL,
  ADD COLUMN `product_category` VARCHAR(100) NULL;

ALTER TABLE `users`
  ADD COLUMN `reset_token` VARCHAR(255) NULL,
  ADD COLUMN `reset_token_expires_at` TIMESTAMP NULL;

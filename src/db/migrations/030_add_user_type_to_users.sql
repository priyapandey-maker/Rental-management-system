-- Migration 030: Add user_type to users
ALTER TABLE `users`
  ADD COLUMN `user_type` ENUM('customer', 'vendor', 'admin') NOT NULL DEFAULT 'customer';

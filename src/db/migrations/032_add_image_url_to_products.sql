-- Migration 032: Add image_url to products
ALTER TABLE `products`
ADD COLUMN `image_url` VARCHAR(1024) NULL AFTER `description`;

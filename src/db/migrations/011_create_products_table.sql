-- Migration 011: Create products master data table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `rental_type` ENUM('rentable', 'consumable', 'service') NOT NULL DEFAULT 'rentable',
  `status` ENUM('active', 'archived', 'draft') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_org_sku` (`organization_id`, `sku`),
  KEY `idx_products_org_id` (`organization_id`),
  KEY `idx_products_category_id` (`category_id`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_rental_type` (`rental_type`),
  CONSTRAINT `fk_products_organization`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organizations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

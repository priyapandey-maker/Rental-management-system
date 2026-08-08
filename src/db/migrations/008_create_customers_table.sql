-- Migration 008: Create customers master data table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `customer_number` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `company_name` VARCHAR(255) NULL,
  `tax_id` VARCHAR(50) NULL,
  `status` ENUM('active', 'inactive', 'blacklisted') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_org_number` (`organization_id`, `customer_number`),
  UNIQUE KEY `uq_customers_org_email` (`organization_id`, `email`),
  KEY `idx_customers_org_id` (`organization_id`),
  KEY `idx_customers_email` (`email`),
  KEY `idx_customers_status` (`status`),
  CONSTRAINT `fk_customers_organization`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organizations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

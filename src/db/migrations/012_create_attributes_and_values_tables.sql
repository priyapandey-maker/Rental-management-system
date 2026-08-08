-- Migration 012: Create attributes and attribute_values master data tables
CREATE TABLE IF NOT EXISTS `attributes` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attributes_org_code` (`organization_id`, `code`),
  KEY `idx_attributes_org_id` (`organization_id`),
  CONSTRAINT `fk_attributes_organization`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organizations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attribute_values` (
  `id` VARCHAR(36) NOT NULL,
  `attribute_id` VARCHAR(36) NOT NULL,
  `value` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attribute_values_attr_code` (`attribute_id`, `code`),
  KEY `idx_attribute_values_attr_id` (`attribute_id`),
  CONSTRAINT `fk_attribute_values_attribute`
    FOREIGN KEY (`attribute_id`)
    REFERENCES `attributes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

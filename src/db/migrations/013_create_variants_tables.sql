-- Migration 013: Create variants and variant_attribute_values master data tables
CREATE TABLE IF NOT EXISTS `variants` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `barcode` VARCHAR(100) NULL,
  `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variants_org_sku` (`organization_id`, `sku`),
  KEY `idx_variants_org_id` (`organization_id`),
  KEY `idx_variants_product_id` (`product_id`),
  KEY `idx_variants_status` (`status`),
  CONSTRAINT `fk_variants_organization`
    FOREIGN KEY (`organization_id`)
    REFERENCES `organizations` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_variants_product`
    FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `variant_attribute_values` (
  `variant_id` VARCHAR(36) NOT NULL,
  `attribute_value_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`, `attribute_value_id`),
  KEY `idx_vav_attr_val_id` (`attribute_value_id`),
  CONSTRAINT `fk_vav_variant`
    FOREIGN KEY (`variant_id`)
    REFERENCES `variants` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_vav_attribute_value`
    FOREIGN KEY (`attribute_value_id`)
    REFERENCES `attribute_values` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

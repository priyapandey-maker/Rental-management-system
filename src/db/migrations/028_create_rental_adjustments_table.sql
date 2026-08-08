CREATE TABLE IF NOT EXISTS `rental_adjustments` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NOT NULL,
  `asset_id` VARCHAR(36) NULL,
  `reason` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('PENDING', 'APPLIED', 'WAIVED', 'PAID') NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rental_adjustments_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_adjustments_tx` FOREIGN KEY (`transaction_id`) REFERENCES `rental_transactions`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_adjustments_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

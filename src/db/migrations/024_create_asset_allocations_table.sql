CREATE TABLE IF NOT EXISTS `asset_allocations` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `transaction_line_id` VARCHAR(36) NOT NULL,
  `asset_id` VARCHAR(36) NOT NULL,
  `status` ENUM('ALLOCATED', 'FULFILLED', 'RETURNED', 'CANCELLED') NOT NULL DEFAULT 'ALLOCATED',
  `quantity` INT NOT NULL DEFAULT 1,
  `allocated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_asset_allocations_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_asset_allocations_tx_line` FOREIGN KEY (`transaction_line_id`) REFERENCES `rental_transaction_lines`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asset_allocations_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_asset_allocations_qty` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rental_commercial_snapshots` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `transaction_line_id` VARCHAR(36) NOT NULL,
  `pricelist_id` VARCHAR(36) NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `deposit_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `late_fee_rate` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rental_snapshots_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_snapshots_tx_line` FOREIGN KEY (`transaction_line_id`) REFERENCES `rental_transaction_lines`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rental_snapshots_pricelist` FOREIGN KEY (`pricelist_id`) REFERENCES `pricelists`(`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_rental_snapshots_price` CHECK (`unit_price` >= 0),
  CONSTRAINT `chk_rental_snapshots_deposit` CHECK (`deposit_amount` >= 0),
  CONSTRAINT `chk_rental_snapshots_late_fee` CHECK (`late_fee_rate` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

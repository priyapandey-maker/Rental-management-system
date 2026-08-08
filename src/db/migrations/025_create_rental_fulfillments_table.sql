CREATE TABLE IF NOT EXISTS `rental_fulfillments` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NOT NULL,
  `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `fulfilled_at` DATETIME(3) NULL,
  `fulfilled_by` VARCHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rental_fulfillments_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_fulfillments_tx` FOREIGN KEY (`transaction_id`) REFERENCES `rental_transactions`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_fulfillments_user` FOREIGN KEY (`fulfilled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rental_fulfillment_lines` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `fulfillment_id` VARCHAR(36) NOT NULL,
  `asset_allocation_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rental_fulfillment_lines_allocation` (`organization_id`, `asset_allocation_id`),
  CONSTRAINT `fk_rental_fulfillment_lines_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_fulfillment_lines_hdr` FOREIGN KEY (`fulfillment_id`) REFERENCES `rental_fulfillments`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rental_fulfillment_lines_alloc` FOREIGN KEY (`asset_allocation_id`) REFERENCES `asset_allocations`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

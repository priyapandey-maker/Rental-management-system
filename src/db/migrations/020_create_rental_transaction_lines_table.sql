CREATE TABLE IF NOT EXISTS `rental_transaction_lines` (
  `id` VARCHAR(36) NOT NULL,
  `organization_id` VARCHAR(36) NOT NULL,
  `transaction_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `variant_id` VARCHAR(36) NULL,
  `quantity` INT NOT NULL,
  `rental_start_date` DATETIME(3) NOT NULL,
  `rental_end_date` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rental_tx_lines_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_tx_lines_tx` FOREIGN KEY (`transaction_id`) REFERENCES `rental_transactions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rental_tx_lines_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_rental_tx_lines_variant` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_rental_tx_lines_qty` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `pricelist_items` (
    `id` VARCHAR(36) NOT NULL,
    `pricelist_id` VARCHAR(36) NOT NULL,
    `product_variant_id` VARCHAR(36) NOT NULL,
    `rental_period_id` VARCHAR(36) NOT NULL,
    `unit_price` DECIMAL(12,2) NOT NULL,
    `min_quantity` DECIMAL(12,3) NOT NULL DEFAULT 1.000,
    `max_quantity` DECIMAL(12,3) NULL,
    `valid_from` DATETIME(3) NULL,
    `valid_to` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `idx_pricelist_items_lookup` (`pricelist_id`, `product_variant_id`, `rental_period_id`, `status`),

    CONSTRAINT `fk_pricelist_items_pricelist`
        FOREIGN KEY (`pricelist_id`)
        REFERENCES `pricelists` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_pricelist_items_variant`
        FOREIGN KEY (`product_variant_id`)
        REFERENCES `variants` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_pricelist_items_period`
        FOREIGN KEY (`rental_period_id`)
        REFERENCES `rental_periods` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `chk_pricelist_items_price`
        CHECK (`unit_price` >= 0),

    CONSTRAINT `chk_pricelist_items_min_quantity`
        CHECK (`min_quantity` > 0),

    CONSTRAINT `chk_pricelist_items_max_quantity`
        CHECK (
            `max_quantity` IS NULL
            OR `max_quantity` >= `min_quantity`
        ),

    CONSTRAINT `chk_pricelist_items_validity`
        CHECK (
            `valid_to` IS NULL
            OR `valid_from` IS NULL
            OR `valid_to` > `valid_from`
        ),

    CONSTRAINT `chk_pricelist_items_status`
        CHECK (`status` IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

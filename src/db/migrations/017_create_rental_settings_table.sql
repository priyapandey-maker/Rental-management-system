SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `rental_settings` (
    `organization_id` VARCHAR(36) NOT NULL,
    `default_pricelist_id` VARCHAR(36) NOT NULL,
    `deposit_type` VARCHAR(20) NOT NULL,
    `default_deposit_value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `grace_period_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `late_fee_unit` VARCHAR(20) NOT NULL,
    `late_fee_rate` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `maximum_late_fee` DECIMAL(12,2) NULL,
    `pickup_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    `delivery_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(36) NULL,

    PRIMARY KEY (`organization_id`),

    CONSTRAINT `fk_rental_settings_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_rental_settings_pricelist`
        FOREIGN KEY (`default_pricelist_id`)
        REFERENCES `pricelists` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_rental_settings_updated_by`
        FOREIGN KEY (`updated_by`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT `chk_rental_settings_deposit_type`
        CHECK (`deposit_type` IN ('FIXED', 'PERCENTAGE')),

    CONSTRAINT `chk_rental_settings_deposit_value`
        CHECK (`default_deposit_value` >= 0),

    CONSTRAINT `chk_rental_settings_late_unit`
        CHECK (`late_fee_unit` IN ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY')),

    CONSTRAINT `chk_rental_settings_late_rate`
        CHECK (`late_fee_rate` >= 0),

    CONSTRAINT `chk_rental_settings_max_late_fee`
        CHECK (
            `maximum_late_fee` IS NULL
            OR `maximum_late_fee` >= 0
        )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

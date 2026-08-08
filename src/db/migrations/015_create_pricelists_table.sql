SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `rental_periods` (
    `id` VARCHAR(36) NOT NULL,
    `organization_id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `duration_value` DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_rental_periods_org_code` (`organization_id`, `code`),

    CONSTRAINT `fk_rental_periods_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `chk_rental_periods_unit`
        CHECK (`unit` IN ('HOUR', 'DAY', 'WEEK', 'MONTH')),

    CONSTRAINT `chk_rental_periods_duration`
        CHECK (`duration_value` > 0),

    CONSTRAINT `chk_rental_periods_status`
        CHECK (`status` IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pricelists` (
    `id` VARCHAR(36) NOT NULL,
    `organization_id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `valid_from` DATETIME(3) NULL,
    `valid_to` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    `active_default_key` TINYINT
        GENERATED ALWAYS AS (
            CASE
                WHEN `status` = 'ACTIVE' AND `is_default` = TRUE THEN 1
                ELSE NULL
            END
        ) STORED,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_pricelists_org_code` (`organization_id`, `code`),
    UNIQUE KEY `uq_pricelists_one_active_default` (`organization_id`, `active_default_key`),

    CONSTRAINT `fk_pricelists_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `chk_pricelists_validity`
        CHECK (`valid_to` IS NULL OR `valid_from` IS NULL OR `valid_to` > `valid_from`),

    CONSTRAINT `chk_pricelists_status`
        CHECK (`status` IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

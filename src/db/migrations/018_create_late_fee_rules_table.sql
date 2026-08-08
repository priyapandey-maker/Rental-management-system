SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `late_fee_rules` (
    `id` VARCHAR(36) NOT NULL,
    `organization_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `charging_unit` VARCHAR(20) NOT NULL,
    `rate` DECIMAL(12,2) NOT NULL,
    `grace_period_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
    `maximum_fee` DECIMAL(12,2) NULL,
    `valid_from` DATETIME(3) NULL,
    `valid_to` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `idx_late_fee_rules_org_status` (`organization_id`, `status`),

    CONSTRAINT `fk_late_fee_rules_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `chk_late_fee_rules_unit`
        CHECK (`charging_unit` IN ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY')),

    CONSTRAINT `chk_late_fee_rules_rate`
        CHECK (`rate` >= 0),

    CONSTRAINT `chk_late_fee_rules_maximum`
        CHECK (`maximum_fee` IS NULL OR `maximum_fee` >= 0),

    CONSTRAINT `chk_late_fee_rules_validity`
        CHECK (
            `valid_to` IS NULL
            OR `valid_from` IS NULL
            OR `valid_to` > `valid_from`
        ),

    CONSTRAINT `chk_late_fee_rules_status`
        CHECK (`status` IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

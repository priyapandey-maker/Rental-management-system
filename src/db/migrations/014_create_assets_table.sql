SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `assets` (
    `id` VARCHAR(36) NOT NULL,
    `organization_id` VARCHAR(36) NOT NULL,
    `product_variant_id` VARCHAR(36) NOT NULL,
    `asset_tag` VARCHAR(80) NOT NULL,
    `serial_number` VARCHAR(150) NULL,
    `qr_code` VARCHAR(150) NULL,
    `acquisition_date` DATE NULL,
    `acquisition_cost` DECIMAL(12,2) NULL,
    `condition_status` VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    `lifecycle_status` VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    `location` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_assets_org_asset_tag` (`organization_id`, `asset_tag`),
    UNIQUE KEY `uq_assets_org_serial` (`organization_id`, `serial_number`),
    UNIQUE KEY `uq_assets_org_qr` (`organization_id`, `qr_code`),
    KEY `idx_assets_variant_status` (`product_variant_id`, `lifecycle_status`),
    KEY `idx_assets_org_status` (`organization_id`, `lifecycle_status`),

    CONSTRAINT `fk_assets_organization`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organizations` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `fk_assets_variant`
        FOREIGN KEY (`product_variant_id`)
        REFERENCES `variants` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT `chk_assets_acquisition_cost`
        CHECK (`acquisition_cost` IS NULL OR `acquisition_cost` >= 0),

    CONSTRAINT `chk_assets_condition`
        CHECK (`condition_status` IN (
            'NEW',
            'GOOD',
            'FAIR',
            'DAMAGED',
            'CRITICAL'
        )),

    CONSTRAINT `chk_assets_lifecycle`
        CHECK (`lifecycle_status` IN (
            'AVAILABLE',
            'RESERVED',
            'ALLOCATED',
            'RENTED',
            'UNDER_MAINTENANCE',
            'DAMAGED',
            'LOST',
            'RETIRED'
        ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

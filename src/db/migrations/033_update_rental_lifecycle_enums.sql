-- Step 1: Add new values to rental_transactions enum without removing ACTIVE yet
ALTER TABLE `rental_transactions`
MODIFY COLUMN `status` ENUM(
    'DRAFT',
    'CONFIRMED',
    'ACTIVE',
    'ALLOCATED',
    'FULFILLED',
    'RETURN_REQUESTED',
    'RETURN_APPROVED',
    'RETURN_RECEIVED',
    'INSPECTED',
    'RESOLVED',
    'COMPLETED',
    'CANCELLED'
) NOT NULL DEFAULT 'DRAFT';

-- Step 2: Migrate data from ACTIVE to FULFILLED
UPDATE `rental_transactions` SET `status` = 'FULFILLED' WHERE `status` = 'ACTIVE';

-- Step 3: Remove ACTIVE from the enum
ALTER TABLE `rental_transactions`
MODIFY COLUMN `status` ENUM(
    'DRAFT',
    'CONFIRMED',
    'ALLOCATED',
    'FULFILLED',
    'RETURN_REQUESTED',
    'RETURN_APPROVED',
    'RETURN_RECEIVED',
    'INSPECTED',
    'RESOLVED',
    'COMPLETED',
    'CANCELLED'
) NOT NULL DEFAULT 'DRAFT';


-- Step 1: Add new values to rental_returns enum without removing PENDING yet
ALTER TABLE `rental_returns`
MODIFY COLUMN `status` ENUM(
    'PENDING',
    'REQUESTED',
    'APPROVED',
    'RECEIVED'
) NOT NULL DEFAULT 'REQUESTED';

-- Step 2: Migrate data from PENDING to REQUESTED
UPDATE `rental_returns` SET `status` = 'REQUESTED' WHERE `status` = 'PENDING';

-- Step 3: Remove PENDING from the enum
ALTER TABLE `rental_returns`
MODIFY COLUMN `status` ENUM(
    'REQUESTED',
    'APPROVED',
    'RECEIVED'
) NOT NULL DEFAULT 'REQUESTED';

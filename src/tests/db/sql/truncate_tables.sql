-- Truncate all tables in the correct order to handle foreign key constraints
BEGIN;

-- Disable foreign key checks temporarily
SET CONSTRAINTS ALL DEFERRED;

-- Truncate vendor-related tables
TRUNCATE TABLE vendor_products CASCADE;
TRUNCATE TABLE vendor_inventory CASCADE;
TRUNCATE TABLE vendor_pricing CASCADE;
TRUNCATE TABLE vendor_attributes CASCADE;
TRUNCATE TABLE vendor_images CASCADE;
TRUNCATE TABLE vendor_dimensions CASCADE;
TRUNCATE TABLE vendor_distributor_info CASCADE;

-- Truncate core tables
TRUNCATE TABLE vendors CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE products CASCADE;

-- Truncate user-related tables
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE user_permissions CASCADE;

-- Re-enable foreign key checks
SET CONSTRAINTS ALL IMMEDIATE;

COMMIT; 
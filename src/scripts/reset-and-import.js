const sequelize = require('../config/database');
const path = require('path');
const bcrypt = require('bcrypt');

// Set required environment variables
process.env.NODE_ENV = 'production';
process.env.FORCE_ONEDRIVE_REAL = '1';
process.env.FORCE_AMAZON_REAL = '1';
process.env.FORCE_LS2_REAL = '1';

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import the models and services
const { RestockVitals, RestockInfo, RestockCost, 
        Vendor, VendorBrand, VendorProduct, VendorDistributorInfo,
        AmazonVitals, AmazonInfo, AmazonPrice, AmazonQuantity,
        User, UserRole, UserPermission } = require('../models');
const { RestockImporter, BellImporter } = require('../services/importers');
const amazonService = require('../services/amazon.service');
const amazonDbService = require('../services/amazonDb.service');
const ls2Service = require('../services/ftp/ftp.ls2.service');

async function createDefaultUsers() {
    console.log('Creating default users...');
    try {
        // Create default roles
        const roles = ['admin', 'manager', 'user'];
        const createdRoles = {};
        
        for (const roleName of roles) {
            const [role] = await UserRole.findOrCreate({
                where: { roleName },
                defaults: { roleName, active: true }
            });
            createdRoles[roleName] = role;
        }

        // Create default users
        const defaultUsers = [
            {
                username: 'admin',
                email: 'admin@gearhubone.com',
                password: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            },
            {
                username: 'manager',
                email: 'manager@gearhubone.com',
                password: 'manager',
                firstName: 'Manager',
                lastName: 'User',
                role: 'manager'
            },
            {
                username: 'user',
                email: 'user@gearhubone.com',
                password: 'user',
                firstName: 'Regular',
                lastName: 'User',
                role: 'user'
            }
        ];

        for (const userData of defaultUsers) {
            // Hash password
            const passwordHash = await bcrypt.hash(userData.password, 10);

            // Create or update user
            const [user] = await User.findOrCreate({
                where: { username: userData.username },
                defaults: {
                    username: userData.username,
                    email: userData.email,
                    passwordHash,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    active: true
                }
            });

            // Assign role
            await UserPermission.findOrCreate({
                where: {
                    userId: user.userId,
                    roleId: createdRoles[userData.role].roleId
                },
                defaults: {
                    userId: user.userId,
                    roleId: createdRoles[userData.role].roleId,
                    active: true
                }
            });

            console.log(`Created/Updated user: ${userData.username} with role: ${userData.role}`);
        }

        console.log('Default users created successfully');
    } catch (error) {
        console.error('Error creating default users:', error);
        throw error;
    }
}

async function resetAndImport() {
    console.log('Starting database reset and import process...');
    
    try {
        // Drop all tables in the correct order (child tables first)
        console.log('Dropping existing tables...');
        
        // Drop user-related tables
        await sequelize.query('DROP TABLE IF EXISTS user_permissions CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS user_roles CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS users CASCADE');
        
        // Drop Amazon child tables
        await sequelize.query('DROP TABLE IF EXISTS amazon_price CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS amazon_quantity CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS amazon_info CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS amazon_vitals CASCADE');
        
        // Drop LS2/Vendor child tables
        await sequelize.query('DROP TABLE IF EXISTS vendor_distributor_info CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS vendor_products CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS vendor_brands CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS vendors CASCADE');
        
        // Drop Restock tables
        await sequelize.query('DROP TABLE IF EXISTS restock_costs CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS restock_info CASCADE');
        await sequelize.query('DROP TABLE IF EXISTS restock_vitals CASCADE');

        // Create tables in correct order (parent tables first)
        console.log('Creating tables...');
        
        // Create user tables
        await UserRole.sync();
        await User.sync();
        await UserPermission.sync();
        
        // Create Restock tables
        await RestockVitals.sync();
        await RestockInfo.sync();
        await RestockCost.sync();
        
        // Create LS2/Vendor tables in correct order
        await Vendor.sync();
        await VendorBrand.sync();
        await VendorProduct.sync({ alter: true });
        await VendorDistributorInfo.sync();
        
        // Create Amazon tables
        await AmazonVitals.sync();
        await AmazonInfo.sync();
        await AmazonPrice.sync();
        await AmazonQuantity.sync();

        // Create default users
        await createDefaultUsers();

        // Create Bell vendor and brand in a single transaction
        console.log('Creating Bell vendor and brand...');
        const transaction = await sequelize.transaction();
        
        try {
            // Create Bell vendor
            const [bellVendor] = await Vendor.findOrCreate({
                where: { vendorName: 'Bell' },
                defaults: {
                    vendorName: 'Bell',
                    vendorCode: 'BELL',
                    active: true
                },
                transaction
            });
            console.log('Bell vendor created/found with ID:', bellVendor.vendorId);

            // Create Bell brand
            const [bellBrand] = await VendorBrand.findOrCreate({
                where: { 
                    brandName: 'Bell',
                    vendorId: bellVendor.vendorId
                },
                defaults: {
                    brandName: 'Bell',
                    brandCode: 'BELL',
                    vendorId: bellVendor.vendorId,
                    active: true
                },
                transaction
            });
            console.log('Bell brand created with ID:', bellBrand.brandId);

            await transaction.commit();
            console.log('Bell vendor and brand setup completed successfully');

            // Import Bell price sheet
            console.log('Importing Bell price sheet...');
            const bellImporter = new BellImporter();
            bellImporter.vendor_id = bellVendor.vendorId;
            bellImporter.brand_id = bellBrand.brandId;
            const bellResults = await bellImporter.importFromOneDrive();
            
            console.log('Bell import completed:', {
                total: bellResults.total,
                success: bellResults.success,
                failed: bellResults.failed
            });

            if (bellResults.errors && bellResults.errors.length > 0) {
                console.error('Bell import errors:', bellResults.errors);
            }

        } catch (error) {
            await transaction.rollback();
            console.error('Error setting up Bell vendor/brand:', error);
            throw error;
        }

        // Import Restock data
        console.log('Importing Restock data...');
        try {
            const restockImporter = new RestockImporter();
            const restockResults = await restockImporter.importFromOneDrive();
            
            console.log('Restock import completed:', {
                total: restockResults.total,
                success: restockResults.success,
                failed: restockResults.failed
            });

            if (restockResults.errors && restockResults.errors.length > 0) {
                console.error('Restock import errors:', restockResults.errors.length);
            }
        } catch (error) {
            console.error('Error during Restock import:', error);
            // Continue with other imports
        }

        // Import LS2 data
        console.log('Importing LS2 data...');
        try {
            const ls2Results = await ls2Service.importAllFiles();
            console.log('LS2 import completed:', {
                totalFiles: ls2Results.totalFiles,
                successfulFiles: ls2Results.processed.filter(r => r.success).length,
                failedFiles: ls2Results.processed.filter(r => !r.success).length
            });

            // Show any LS2 errors
            const ls2Errors = ls2Results.processed.filter(r => !r.success);
            if (ls2Errors.length > 0) {
                console.error('LS2 import errors:', ls2Errors.length);
            }
        } catch (error) {
            console.error('Error during LS2 import:', error);
            // Continue with other imports
        }

        // Import Amazon data
        console.log('Starting Amazon import...');
        try {
            // Get listings from Amazon API
            console.log('Fetching listings from Amazon SP-API...');
            const amazonListings = await amazonService.getAllListings();
            
            if (!amazonListings.success) {
                console.error('Error fetching Amazon listings:', amazonListings.message);
            } else {
                // Save listings to database
                console.log('Saving Amazon listings to database...');
                const saveResults = await amazonDbService.saveListings(amazonListings.data);
                console.log('Amazon listings saved:', {
                    savedCount: saveResults.savedCount,
                    errorCount: saveResults.errorCount
                });
            }

            // Get Amazon inventory
            console.log('Fetching Amazon inventory...');
            const amazonInventory = await amazonService.getInventory();
            console.log('Amazon inventory fetched:', {
                count: amazonInventory.payload?.inventorySummaries?.length || 0
            });
        } catch (error) {
            console.error('Error during Amazon import:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            // Continue with completion
        }

        console.log('All imports completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error during import process:', error);
        process.exit(1);
    }
}

// Run the reset and import
resetAndImport(); 
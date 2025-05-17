const sequelize = require('../config/database');
const path = require('path');

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
        AmazonVitals, AmazonInfo, AmazonPrice, AmazonQuantity } = require('../models');
const RestockImporter = require('../services/importers/restock.importer');
const amazonService = require('../services/amazon.service');
const amazonDbService = require('../services/amazonDb.service');
const ls2Service = require('../services/ftp/ftp.ls2.service');

function logMemoryUsage() {
    const used = process.memoryUsage();
    console.log('\nMemory Usage:');
    for (let key in used) {
        console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
}

async function resetAndImport() {
    console.log('\nStarting database reset and import process...');
    logMemoryUsage();
    
    try {
        // Drop all tables in the correct order (child tables first)
        console.log('\nDropping existing tables...');
        
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
        
        console.log('Tables dropped successfully');

        // Create tables in correct order (parent tables first)
        console.log('\nCreating tables...');
        
        // Create Restock tables
        await RestockVitals.sync();
        await RestockInfo.sync();
        await RestockCost.sync();
        
        // Create LS2/Vendor tables in correct order
        await Vendor.sync();
        await VendorBrand.sync();
        await VendorProduct.sync({ alter: true }); // Add alter:true to ensure mfg_part is unique
        await VendorDistributorInfo.sync();
        
        // Create Amazon tables
        await AmazonVitals.sync();
        await AmazonInfo.sync();
        await AmazonPrice.sync();
        await AmazonQuantity.sync();
        
        console.log('Tables created successfully');
        logMemoryUsage();

        // Import Restock data
        console.log('\nImporting Restock data...');
        const restockImporter = new RestockImporter();
        console.log('\nRestock Importer Configuration:');
        console.log('Folder Path:', restockImporter.folderPath);
        console.log('File Name:', restockImporter.filename);
        console.log('Batch Size:', restockImporter.batchSize);
        
        const restockResults = await restockImporter.importFromOneDrive();
        logMemoryUsage();
        
        console.log('\nRestock import results:', {
            total: restockResults.total,
            success: restockResults.success,
            failed: restockResults.failed,
            errorCount: restockResults.errors.length
        });

        if (restockResults.errors.length > 0) {
            console.log('\nRestock import errors:');
            restockResults.errors.slice(0, 5).forEach((error, i) => {
                console.log(`\nError ${i + 1}:`);
                console.log('Record:', error.record);
                console.log('Error:', error.error);
            });
        }

        // Import LS2 data
        console.log('\nImporting LS2 data...');
        const ls2Results = await ls2Service.importAllFiles();
        console.log('\nLS2 import results:', {
            totalFiles: ls2Results.totalFiles,
            processedFiles: ls2Results.processed.length,
            successfulFiles: ls2Results.processed.filter(r => r.success).length,
            failedFiles: ls2Results.processed.filter(r => !r.success).length
        });

        // Show any LS2 errors
        const ls2Errors = ls2Results.processed.filter(r => !r.success);
        if (ls2Errors.length > 0) {
            console.log('\nLS2 import errors:');
            ls2Errors.forEach((error, i) => {
                console.log(`\nError in file ${error.file}:`, error.error);
            });
        }

        // Import Amazon data
        console.log('\nStarting Amazon import...');
        console.log('Amazon Environment Variables:');
        console.log('AMAZON_CLIENT_ID:', process.env.AMAZON_CLIENT_ID?.substring(0, 5) + '...');
        console.log('AMAZON_CLIENT_SECRET:', process.env.AMAZON_CLIENT_SECRET?.substring(0, 5) + '...');
        console.log('AMAZON_REFRESH_TOKEN:', process.env.AMAZON_REFRESH_TOKEN?.substring(0, 5) + '...');
        console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY?.substring(0, 5) + '...');
        console.log('AWS_SECRET_KEY:', process.env.AWS_SECRET_KEY?.substring(0, 5) + '...');
        console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
        
        try {
            // Get listings from Amazon API
            console.log('\nFetching listings from Amazon SP-API...');
            const amazonListings = await amazonService.getAllListings();
            console.log('\nAmazon API results:', {
                total: amazonListings.count,
                success: amazonListings.success
            });

            if (!amazonListings.success) {
                console.error('\nError fetching Amazon listings:', amazonListings.message);
            } else {
                // Log a sample of the data
                if (amazonListings.data && amazonListings.data.length > 0) {
                    console.log('\nSample Amazon listing data (first item):');
                    console.log(JSON.stringify(amazonListings.data[0], null, 2));
                    console.log('\nAvailable fields:', Object.keys(amazonListings.data[0]).join(', '));
                }
                
                // Save listings to database
                console.log('\nSaving Amazon listings to database...');
                const saveResults = await amazonDbService.saveListings(amazonListings.data);
                console.log('Database save results:', {
                    success: saveResults.success,
                    savedCount: saveResults.savedCount,
                    errorCount: saveResults.errorCount,
                    message: saveResults.message
                });
            }

            // Get Amazon inventory
            console.log('\nFetching Amazon inventory...');
            const amazonInventory = await amazonService.getInventory();
            console.log('Amazon inventory fetched:', {
                inventorySummaries: amazonInventory.payload?.inventorySummaries?.length || 0
            });
        } catch (error) {
            console.error('\nError during Amazon import:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            console.error('Stack trace:', error.stack);
        }

        // TODO: Save inventory data to database
        // This will require implementing inventory save functionality in amazonDb.service.js

        console.log('\nAll imports completed successfully!');
        logMemoryUsage();
        process.exit(0);
    } catch (error) {
        console.error('\nError during import process:', error);
        console.error('Stack trace:', error.stack);
        logMemoryUsage();
        process.exit(1);
    }
}

// Run the reset and import
resetAndImport(); 
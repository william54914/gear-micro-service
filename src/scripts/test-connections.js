const sequelize = require('../config/database');
const OneDriveClient = require('../services/onedrive.service');
const amazonService = require('../services/amazon.service');
const ls2Service = require('../services/ftp/ftp.ls2.service');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function testConnections() {
    console.log('\n🔍 Testing all external service connections...\n');
    
    try {
        // Test Database Connection
        console.log('Testing Database Connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful!\n');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }

    try {
        // Test OneDrive Connection
        console.log('Testing OneDrive Connection...');
        const oneDriveClient = new OneDriveClient();
        const folders = await oneDriveClient.listRootFolders();
        console.log('✅ OneDrive connection successful!');
        console.log(`Found ${folders.length} folders in root\n`);
    } catch (error) {
        console.error('❌ OneDrive connection failed:', error.message);
    }

    try {
        // Test Amazon SP-API Connection
        console.log('Testing Amazon SP-API Connection...');
        const result = await amazonService.getInventory();
        console.log('✅ Amazon SP-API connection successful!');
        console.log(`Retrieved ${result.payload?.inventorySummaries?.length || 0} inventory items\n`);
    } catch (error) {
        console.error('❌ Amazon SP-API connection failed:', error.message);
    }

    try {
        // Test LS2 FTP Connection
        console.log('Testing LS2 FTP Connection...');
        const files = await ls2Service.listFiles();
        console.log('✅ LS2 FTP connection successful!');
        console.log(`Found ${files.length} files on FTP server\n`);
    } catch (error) {
        console.error('❌ LS2 FTP connection failed:', error.message);
    }

    console.log('\n🏁 Connection tests completed!\n');
    process.exit(0);
}

testConnections(); 
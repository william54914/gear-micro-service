const spApi = require('../../.api/apis/sp-api/index.js');
const axios = require('axios');
const qs = require('querystring');
const zlib = require('zlib');
const { promisify } = require('util');
const gunzip = promisify(zlib.gunzip);

class AmazonService {
	constructor () {
		this.spApi = spApi;

		// Configure the SDK
		this.spApi.config({
			region: process.env.AMAZON_REGION || 'us-east-1'
		});
		
		this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
	}

	async getInventory () {
		try {
			// Debug logging for environment variables
			console.log('Amazon Auth Debug Info:');
			console.log('Client ID:', process.env.AMAZON_CLIENT_ID ? 'Set' : 'Not set');
			console.log('Client Secret:', process.env.AMAZON_CLIENT_SECRET ? 'Set' : 'Not set');
			console.log('Refresh Token:', process.env.AMAZON_REFRESH_TOKEN ? 'Set' : 'Not set');
			console.log('AWS Access Key:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
			console.log('AWS Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
			console.log('Role ARN:', process.env.AMAZON_ROLE_ARN ? 'Set' : 'Not set');
			console.log('Region:', process.env.AMAZON_REGION || 'us-east-1');

			// Use the inventory API that's available in the SDK
			console.log('Making API call to Amazon SP-API for inventory summaries...');
			
			// Get LWA token using client credentials and refresh token
			const accessToken = await this.getAccessToken();
			
			// Use the SDK's getInventorySummaries method
			const response = await this.spApi.getInventorySummaries({
				query: {
					marketplaceIds: [ 'ATVPDKIKX0DER' ],  // US marketplace
					details: true,
					granularityType: 'Marketplace',
					granularityId: 'ATVPDKIKX0DER'
				},
				headers: {
					'x-amz-access-token': accessToken
				}
			});

			return response.data;
		} catch (error) {
			console.error('Error in AmazonService.getInventory:', error);
			if (error.data && error.data.errors) {
				console.error('API Error Details:', JSON.stringify(error.data.errors, null, 2));
			}
			throw error;
		}
	}

	async getAccessToken() {
		// Make a direct request to LWA to get the access token
		const tokenResponse = await axios.post('https://api.amazon.com/auth/o2/token', qs.stringify({
			grant_type: 'refresh_token',
			refresh_token: process.env.AMAZON_REFRESH_TOKEN,
			client_id: process.env.AMAZON_CLIENT_ID,
			client_secret: process.env.AMAZON_CLIENT_SECRET
		}), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		
		if (!tokenResponse.data || !tokenResponse.data.access_token) {
			throw new Error('Failed to get access token from LWA');
		}
		
		console.log('Successfully obtained LWA access token');
		return tokenResponse.data.access_token;
	}

	async getAllListings() {
		try {
			// Since the SDK doesn't have Reports API methods, we'll make direct HTTP requests
			console.log('Making direct HTTP requests to Amazon SP-API Reports API...');
			
			// Get access token
			const accessToken = await this.getAccessToken();
			
			// 1. Create a report request
			console.log('Step 1: Creating report request...');
			const createReportResponse = await axios.post(
				`${this.baseUrl}/reports/2021-06-30/reports`, 
				{
					reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
					marketplaceIds: ['ATVPDKIKX0DER'], // US marketplace
					dataStartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
					dataEndTime: new Date().toISOString()
				},
				{
					headers: {
						'x-amz-access-token': accessToken,
						'Content-Type': 'application/json'
					}
				}
			);
			
			const reportId = createReportResponse.data.reportId;
			console.log('Report requested with ID:', reportId);
			
			// 2. Poll for report completion
			console.log('Step 2: Polling for report completion...');
			let reportStatus;
			let attempts = 0;
			const maxAttempts = 10;
			
			do {
				console.log(`Checking report status (attempt ${attempts + 1}/${maxAttempts})...`);
				
				const reportStatusResponse = await axios.get(
					`${this.baseUrl}/reports/2021-06-30/reports/${reportId}`,
					{
						headers: {
							'x-amz-access-token': accessToken
						}
					}
				);
				
				reportStatus = reportStatusResponse.data;
				console.log('Report status:', reportStatus.processingStatus);
				
				if (reportStatus.processingStatus !== 'DONE') {
					// Wait 10 seconds before checking again
					await new Promise(resolve => setTimeout(resolve, 10000));
				}
				
				attempts++;
			} while (reportStatus.processingStatus !== 'DONE' && attempts < maxAttempts);
			
			if (reportStatus.processingStatus !== 'DONE') {
				throw new Error('Report processing timed out');
			}
			
			// 3. Get report document details
			console.log('Step 3: Getting report document details...');
			const reportDocumentId = reportStatus.reportDocumentId;
			
			const reportDocResponse = await axios.get(
				`${this.baseUrl}/reports/2021-06-30/documents/${reportDocumentId}`,
				{
					headers: {
						'x-amz-access-token': accessToken
					}
				}
			);
			
			const reportDocument = reportDocResponse.data;
			console.log('Report document URL obtained');
			console.log('Compression format:', reportDocument.compressionAlgorithm);
			
			// 4. Download the report
			console.log('Step 4: Downloading report...');
			const reportDataResponse = await axios.get(reportDocument.url, {
				responseType: 'arraybuffer' // Important: use arraybuffer for binary data
			});
			
			// 5. Decompress if needed and parse the report
			console.log('Step 5: Processing and parsing report data...');
			let reportData;
			
			// Check if the data is compressed
			if (reportDocument.compressionAlgorithm === 'GZIP') {
				console.log('Decompressing GZIP data...');
				const buffer = Buffer.from(reportDataResponse.data);
				const decompressed = await gunzip(buffer);
				reportData = decompressed.toString('utf8');
			} else {
				// If not compressed, convert ArrayBuffer to string
				reportData = Buffer.from(reportDataResponse.data).toString('utf8');
			}
			
			console.log('Report data decoded successfully');
			
			// Parse the tab-delimited data
			const lines = reportData.split('\n');
			console.log(`Found ${lines.length} lines in the report`);
			
			// Get headers from the first line
			const headers = lines[0].split('\t');
			console.log(`Found ${headers.length} columns in the report`);
			
			// Process data rows
			const results = [];
			for (let i = 1; i < lines.length; i++) {
				if (!lines[i].trim()) continue;
				
				const values = lines[i].split('\t');
				const item = {};
				
				for (let j = 0; j < headers.length; j++) {
					if (j < values.length) {
						item[headers[j]] = values[j];
					}
				}
				
				results.push(item);
			}
			
			console.log(`Successfully parsed ${results.length} listings`);
			
			// Return a sample of the data to avoid overwhelming the response
			const sampleSize = 100;
			const sample = results.slice(0, sampleSize);
			
			return {
				success: true,
				message: 'Listings retrieved successfully',
				count: results.length,
				sampleSize,
				data: sample
			};
		} catch (error) {
			console.error('Error in AmazonService.getAllListings:', error);
			if (error.response) {
				console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
			}
			throw error;
		}
	}
}

module.exports = new AmazonService(); 
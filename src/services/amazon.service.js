const spApi = require('../../.api/apis/sp-api/index.js');
const axios = require('axios');
const qs = require('querystring');
const zlib = require('zlib');
const { promisify } = require('util');
const BaseService = require('./base.service');
const gunzip = promisify(zlib.gunzip);

class AmazonService extends BaseService {
	constructor() {
		super('amazon'); // This will validate Amazon config

		this.spApi = spApi;
		this.spApi.config({
			region: this.config.amazon.region
		});
		
		this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
	}

	async getInventory() {
		try {
			const accessToken = await this.getAccessToken();
			
			const response = await this.spApi.getInventorySummaries({
				query: {
					marketplaceIds: ['ATVPDKIKX0DER'],
					details: true,
					granularityType: 'Marketplace',
					granularityId: 'ATVPDKIKX0DER'
				},
				headers: {
					'x-amz-access-token': accessToken
				}
			});

			return this.success(response.data, 'Inventory retrieved successfully');
		} catch (error) {
			console.error('Error in AmazonService.getInventory:', error);
			if (error.data?.errors) {
				console.error('API Error Details:', JSON.stringify(error.data.errors, null, 2));
			}
			throw error;
		}
	}

	async getAccessToken() {
		try {
			// Log the raw values for debugging (but mask sensitive parts)
			console.log('Debug Auth Parameters:');
			console.log('Client ID:', this.config.amazon.clientId?.slice(0, 6) + '...');
			console.log('Client Secret:', this.config.amazon.clientSecret?.slice(0, 6) + '...');
			console.log('Refresh Token Length:', this.config.amazon.refreshToken?.length);

			// Properly encode each parameter individually
			const params = {
				grant_type: 'refresh_token',
				refresh_token: encodeURIComponent(this.config.amazon.refreshToken),
				client_id: encodeURIComponent(this.config.amazon.clientId),
				client_secret: encodeURIComponent(this.config.amazon.clientSecret)
			};

			// Make the request with properly encoded parameters
			const tokenResponse = await axios.post('https://api.amazon.com/auth/o2/token', 
				Object.entries(params)
					.map(([key, value]) => `${key}=${value}`)
					.join('&'),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			if (!tokenResponse.data || !tokenResponse.data.access_token) {
				console.error('Token response data:', JSON.stringify(tokenResponse.data, null, 2));
				throw new Error('Failed to get access token from LWA');
			}

			console.log('Successfully obtained LWA access token');
			return tokenResponse.data.access_token;
		} catch (error) {
			console.error('Error getting access token:', error.message);
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', JSON.stringify(error.response.data, null, 2));
			}
			throw error;
		}
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
			
			// Return all data instead of just a sample
			return {
				success: true,
				message: 'Listings retrieved successfully',
				count: results.length,
				data: results
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
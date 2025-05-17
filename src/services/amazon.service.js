const spApi = require('../../.api/apis/sp-api/index.js');
const axios = require('axios');
const qs = require('querystring');
const zlib = require('zlib');
const { promisify } = require('util');
const BaseService = require('./base.service');
const gunzip = promisify(zlib.gunzip);
const config = require('../config/env');
const aws4 = require('aws4');
const https = require('https');

class AmazonService extends BaseService {
	constructor() {
		super('amazon');

		if (process.env.NODE_ENV === 'test' && !process.env.FORCE_AMAZON_REAL) {
			this.config = {
				region: 'us-east-1',
				refreshToken: 'test-refresh-token',
				clientId: 'test-client-id',
				clientSecret: 'test-client-secret',
				accessKeyId: 'test-access-key',
				secretAccessKey: 'test-secret-key',
				roleArn: 'test-role-arn',
				marketplaceId: 'test-marketplace-id'
			};
			this.spApi = {
				config: () => {},
				auth: {
					getToken: () => Promise.resolve({ access_token: 'test-token' })
				}
			};
			this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
			return;
		}

		this.spApi = spApi;
		this.spApi.config({
			region: process.env.AMAZON_REGION || 'us-east-1',
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY,
			role: process.env.AMAZON_ROLE_ARN
		});
		
		this.baseUrl = 'https://sellingpartnerapi-na.amazon.com';
	}

	async getInventory() {
		try {
			const accessToken = await this.getAccessToken();

			const opts = {
				host: 'sellingpartnerapi-na.amazon.com',
				path: '/fba/inventory/v1/summaries?marketplaceIds=ATVPDKIKX0DER&details=true&granularityType=Marketplace&granularityId=ATVPDKIKX0DER',
				service: 'execute-api',
				region: process.env.AMAZON_REGION || 'us-east-1',
				method: 'GET',
				headers: {
					'x-amz-access-token': accessToken,
					'Content-Type': 'application/json'
				}
			};
			aws4.sign(opts, {
				accessKeyId: process.env.AWS_ACCESS_KEY,
				secretAccessKey: process.env.AWS_SECRET_KEY
			});

			return await new Promise((resolve, reject) => {
				https.get(opts, (res) => {
					let data = '';
					res.on('data', chunk => data += chunk);
					res.on('end', () => {
						try {
							const json = JSON.parse(data);
							if (res.statusCode === 200) {
								resolve(json);
							} else {
								console.error('Amazon API error:', json);
								reject(new Error(json.message || 'Amazon API error'));
							}
						} catch (err) {
							reject(err);
						}
					});
				}).on('error', reject);
			});
		} catch (error) {
			console.error('Error in AmazonService.getInventory:', error);
			throw error;
		}
	}

	async getAccessToken() {
		try {
			const params = {
				grant_type: 'refresh_token',
				refresh_token: encodeURIComponent(config.amazon.refreshToken),
				client_id: encodeURIComponent(config.amazon.clientId),
				client_secret: encodeURIComponent(config.amazon.clientSecret)
			};

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
				throw new Error('Failed to get access token from LWA');
			}

			return tokenResponse.data.access_token;
		} catch (error) {
			console.error('Error getting access token:', error.message);
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', error.response.data);
			}
			throw error;
		}
	}

	async getAllListings() {
		try {
			const accessToken = await this.getAccessToken();
			
			// 1. Create a report request
			const createReportResponse = await axios.post(
				`${this.baseUrl}/reports/2021-06-30/reports`, 
				{
					reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
					marketplaceIds: ['ATVPDKIKX0DER'],
					dataStartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
			
			// 2. Poll for report completion
			let reportStatus;
			let attempts = 0;
			const maxAttempts = 10;
			
			do {
				const reportStatusResponse = await axios.get(
					`${this.baseUrl}/reports/2021-06-30/reports/${reportId}`,
					{
						headers: {
							'x-amz-access-token': accessToken
						}
					}
				);
				
				reportStatus = reportStatusResponse.data;
				
				if (reportStatus.processingStatus !== 'DONE') {
					await new Promise(resolve => setTimeout(resolve, 10000));
				}
				
				attempts++;
			} while (reportStatus.processingStatus !== 'DONE' && attempts < maxAttempts);
			
			if (reportStatus.processingStatus !== 'DONE') {
				throw new Error('Report processing timed out');
			}
			
			// 3. Get report document details
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
			
			// 4. Download the report
			const reportDataResponse = await axios.get(reportDocument.url, {
				responseType: 'arraybuffer'
			});
			
			// 5. Process and parse the report
			let reportData;
			
			if (reportDocument.compressionAlgorithm === 'GZIP') {
				const buffer = Buffer.from(reportDataResponse.data);
				const decompressed = await gunzip(buffer);
				reportData = decompressed.toString('utf8');
			} else {
				reportData = Buffer.from(reportDataResponse.data).toString('utf8');
			}
			
			// Parse the tab-delimited data
			const lines = reportData.split('\n');
			const headers = lines[0].split('\t');
			
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
			
			return {
				success: true,
				message: 'Listings retrieved successfully',
				count: results.length,
				data: results
			};
		} catch (error) {
			console.error('Error in AmazonService.getAllListings:', error);
			if (error.response) {
				console.error('API Error Details:', error.response.data);
			}
			throw error;
		}
	}
}

module.exports = new AmazonService(); 
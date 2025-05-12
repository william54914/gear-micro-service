const spApi = require('../../.api/apis/sp-api/index.js');

class AmazonService {
	constructor () {
		this.spApi = spApi;

		// Configure the SDK
		this.spApi.config({
			region: process.env.AMAZON_REGION || 'us-east-1'
		});
	}

	async getInventory (marketplaceId) {
		try {
			// Set up authentication before making the request
			this.spApi.auth(
				process.env.AMAZON_CLIENT_ID,
				process.env.AMAZON_CLIENT_SECRET
			);

			// Set up AWS credentials
			this.spApi.auth(
				process.env.AWS_ACCESS_KEY_ID,
				process.env.AWS_SECRET_ACCESS_KEY
			);

			// Set up refresh token
			if (process.env.AMAZON_REFRESH_TOKEN) {
				this.spApi.auth(process.env.AMAZON_REFRESH_TOKEN);
			}

			// Set up role ARN if provided
			if (process.env.AMAZON_ROLE_ARN) {
				this.spApi.config({
					roleArn: process.env.AMAZON_ROLE_ARN
				});
			}

			const response = await this.spApi.getInventorySummaries({
				query: {
					marketplaceIds: [ marketplaceId ],
					details: true,
					granularityType: 'Marketplace',
					granularityId: marketplaceId
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
}

module.exports = new AmazonService(); 
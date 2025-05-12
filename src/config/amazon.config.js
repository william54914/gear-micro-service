require('dotenv').config();

const amazonConfig = {
    region: process.env.AMAZON_REGION || 'us-east-1',
    refreshToken: process.env.AMAZON_REFRESH_TOKEN,
    clientId: process.env.AMAZON_CLIENT_ID,
    clientSecret: process.env.AMAZON_CLIENT_SECRET,
    roleArn: process.env.AMAZON_ROLE_ARN,
    marketplaceIds: {
        'US': 'ATVPDKIKX0DER',  // US
        'CA': 'A2EUQ1WTGCTBG2', // Canada
        'MX': 'A1AM78C64UM0Y8', // Mexico
        'BR': 'A2Q3Y263D00KWC', // Brazil
        'ES': 'A1RKKUPIHCS9HS', // Spain
        'UK': 'A1F83G8C2ARO7P', // UK
        'FR': 'A13V1IB3VIYZZH', // France
        'DE': 'A1PA6795UKMFR9', // Germany
        'IT': 'APJ6JRA9NG5V4',  // Italy
        'JP': 'A1VC38T7YXB528', // Japan
        'AU': 'A39IBJ37TRP1C6', // Australia
        'IN': 'A21TJRUUN4KGV',  // India
        'SG': 'A19VAU5U5O7RUS', // Singapore
        'AE': 'A2VIGQ35RCS4UG', // UAE
        'SA': 'A17E79C6D8DWNP', // Saudi Arabia
        'SE': 'A2NODRKZP88ZB9', // Sweden
        'NL': 'A1805IZSGTT6HS', // Netherlands
        'PL': 'A1C3SOZRARQ6R3', // Poland
        'EG': 'ARBP9OOSHTCHU',  // Egypt
        'TR': 'A33AVAJ2PDY3EV', // Turkey
    }
};

module.exports = amazonConfig; 
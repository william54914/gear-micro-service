import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const listingDuration = new Trend('listing_duration');
const searchDuration = new Trend('search_duration');
const detailsDuration = new Trend('details_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests must complete below 2s
    'http_req_failed': ['rate<0.05'],    // Less than 5% of requests can fail
    'errors': ['rate<0.1'],              // Less than 10% error rate
    'listing_duration': ['p(95)<1000'],  // 95% of listing requests under 1s
    'search_duration': ['p(95)<1500'],   // 95% of search requests under 1.5s
    'details_duration': ['p(95)<800'],   // 95% of details requests under 800ms
  },
};

// Simulated user behavior under stress
export default function() {
  const baseUrl = __ENV.API_URL || 'http://localhost:3000/api';
  const authToken = __ENV.AUTH_TOKEN;

  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Random sleep between requests (100ms to 1s)
  const randomSleep = () => sleep(Math.random() * 0.9 + 0.1);

  // Group 1: List Products with Random Pagination
  {
    const page = Math.floor(Math.random() * 10) + 1;
    const limit = [10, 20, 50][Math.floor(Math.random() * 3)];
    
    const startTime = new Date();
    const listResponse = http.get(
      `${baseUrl}/vendors/products?page=${page}&limit=${limit}`,
      params
    );
    listingDuration.add(new Date() - startTime);
    
    check(listResponse, {
      'list status is 200': (r) => r.status === 200,
      'list response is valid': (r) => r.json().success === true,
    }) || errorRate.add(1);

    randomSleep();
  }

  // Group 2: Search Products with Random Terms
  {
    const searchTerms = ['test', 'product', 'black', 'large', 'new'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const startTime = new Date();
    const searchResponse = http.get(
      `${baseUrl}/vendors/products/search?query=${randomTerm}&page=1&limit=20`,
      params
    );
    searchDuration.add(new Date() - startTime);
    
    check(searchResponse, {
      'search status is 200': (r) => r.status === 200,
      'search response is valid': (r) => r.json().success === true,
    }) || errorRate.add(1);

    randomSleep();
  }

  // Group 3: Get Multiple Product Details
  {
    // Get a list of products first
    const listResponse = http.get(`${baseUrl}/vendors/products?page=1&limit=5`, params);
    const products = listResponse.json().data.items || [];

    // Get details for each product
    for (const product of products) {
      const startTime = new Date();
      const detailsResponse = http.get(
        `${baseUrl}/vendors/products/${product.vendorProductId}`,
        params
      );
      detailsDuration.add(new Date() - startTime);
      
      check(detailsResponse, {
        'details status is 200': (r) => r.status === 200,
        'details are complete': (r) => {
          const data = r.json().data;
          return data.vendorProductId && data.vendorSku;
        },
      }) || errorRate.add(1);

      randomSleep();
    }
  }

  // Group 4: Concurrent Requests (simulating multiple tabs)
  {
    const requests = [
      {
        method: 'GET',
        url: `${baseUrl}/vendors/products?page=1&limit=10`,
        params: params
      },
      {
        method: 'GET',
        url: `${baseUrl}/vendors/products/search?query=test`,
        params: params
      },
      {
        method: 'GET',
        url: `${baseUrl}/vendors/brands`,
        params: params
      }
    ];

    const responses = http.batch(requests);
    
    responses.forEach((response, index) => {
      check(response, {
        [`concurrent request ${index} successful`]: (r) => r.status === 200,
      }) || errorRate.add(1);
    });

    randomSleep();
  }

  // Group 5: Heavy Operations (less frequent)
  if (__ITER % 20 === 0) { // Only run this every 20th iteration
    const bulkProducts = Array.from({ length: 5 }, (_, i) => ({
      vendorId: 1,
      brandId: 1,
      vendorSku: `STRESS-${Date.now()}-${i}`,
      vendorProductName: `Stress Test Product ${i}`,
      description: 'Created during stress test',
      msrp: 99.99 + i
    }));

    const bulkResponse = http.post(
      `${baseUrl}/vendors/products/bulk`,
      JSON.stringify(bulkProducts),
      params
    );

    check(bulkResponse, {
      'bulk create successful': (r) => r.status === 201,
      'all products created': (r) => {
        const data = r.json().data;
        return data.success === bulkProducts.length;
      },
    }) || errorRate.add(1);

    sleep(2); // Longer sleep after heavy operation
  }
} 
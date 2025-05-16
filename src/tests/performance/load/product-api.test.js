import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],   // Less than 1% of requests can fail
    'errors': ['rate<0.05'],            // Less than 5% error rate
  },
};

// Simulated user behavior
export default function() {
  const baseUrl = __ENV.API_URL || 'http://localhost:3000/api';
  const authToken = __ENV.AUTH_TOKEN; // Set this in your k6 run command

  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Group 1: List Products
  {
    const listResponse = http.get(`${baseUrl}/vendors/products?page=1&limit=10`, params);
    
    check(listResponse, {
      'list products status is 200': (r) => r.status === 200,
      'list products has items': (r) => r.json().data.items.length > 0,
    }) || errorRate.add(1);

    sleep(1);
  }

  // Group 2: Search Products
  {
    const searchResponse = http.get(
      `${baseUrl}/vendors/products/search?query=test&page=1&limit=10`,
      params
    );
    
    check(searchResponse, {
      'search status is 200': (r) => r.status === 200,
      'search response is valid': (r) => r.json().success === true,
    }) || errorRate.add(1);

    sleep(1);
  }

  // Group 3: Get Product Details
  {
    // Get a random product ID from the list
    const listResponse = http.get(`${baseUrl}/vendors/products?page=1&limit=1`, params);
    const productId = listResponse.json().data.items[0]?.vendorProductId;

    if (productId) {
      const detailsResponse = http.get(
        `${baseUrl}/vendors/products/${productId}`,
        params
      );
      
      check(detailsResponse, {
        'get details status is 200': (r) => r.status === 200,
        'details are complete': (r) => {
          const data = r.json().data;
          return data.vendorProductId && data.vendorSku && data.vendorProductName;
        },
      }) || errorRate.add(1);
    }

    sleep(1);
  }

  // Group 4: Create and Delete Product (less frequent)
  if (__ITER % 10 === 0) { // Only run this every 10th iteration
    // Create product
    const createResponse = http.post(
      `${baseUrl}/vendors/products`,
      JSON.stringify({
        vendorId: 1,
        brandId: 1,
        vendorSku: `SKU-${Date.now()}`,
        vendorProductName: 'Load Test Product',
        description: 'Created during load test',
        msrp: 99.99
      }),
      params
    );

    check(createResponse, {
      'create status is 201': (r) => r.status === 201,
      'create response has id': (r) => r.json().data.vendorProductId > 0,
    }) || errorRate.add(1);

    // If creation successful, delete the product
    if (createResponse.status === 201) {
      const productId = createResponse.json().data.vendorProductId;
      const deleteResponse = http.del(
        `${baseUrl}/vendors/products/${productId}`,
        null,
        params
      );

      check(deleteResponse, {
        'delete status is 200': (r) => r.status === 200,
      }) || errorRate.add(1);
    }

    sleep(2);
  }
} 
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = (__ENV.BASE_URL || '').replace(/\/$/, '');
const API_TOKEN = __ENV.API_TOKEN || '';
const SMOKE_EMAIL = __ENV.SMOKE_EMAIL || '';
const SMOKE_PASSWORD = __ENV.SMOKE_PASSWORD || '';

if (!BASE_URL) {
  throw new Error('BASE_URL is required');
}

const endpoints = new SharedArray('endpoints', function () {
  const parsed = JSON.parse(open('./endpoints.json'));

  if (!Array.isArray(parsed)) {
    throw new Error('endpoints.json must contain an array');
  }

  return parsed;
});

export const options = {
  vus: 1,
  iterations: 10,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};

function resolveBody(body) {
  if (!body) {
    return {};
  }

  const text = JSON.stringify(body)
    .replaceAll('${SMOKE_EMAIL}', SMOKE_EMAIL)
    .replaceAll('${SMOKE_PASSWORD}', SMOKE_PASSWORD);

  return JSON.parse(text);
}

function shouldSkip(api) {
  if (api.requiresToken && !API_TOKEN) {
    return true;
  }

  if (api.requiresCredentials && (!SMOKE_EMAIL || !SMOKE_PASSWORD)) {
    return true;
  }

  return false;
}

export default function () {
  for (const api of endpoints) {
    if (shouldSkip(api)) {
      continue;
    }

    const method = String(api.method || 'GET').toUpperCase();
    const url = `${BASE_URL}${api.path}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers.Authorization = `Bearer ${API_TOKEN}`;
    }

    const params = {
      headers,
      tags: { api: api.name },
    };
    const body = JSON.stringify(resolveBody(api.body));
    let response;

    if (method === 'POST') {
      response = http.post(url, body, params);
    } else if (method === 'PUT') {
      response = http.put(url, body, params);
    } else if (method === 'DELETE') {
      response = http.del(url, null, params);
    } else {
      response = http.get(url, params);
    }

    check(response, {
      [`${api.name} status is ${api.expectedStatus}`]: (r) => r.status === api.expectedStatus,
      [`${api.name} response time < 800ms`]: (r) => r.timings.duration < 800,
    });

    sleep(1);
  }
}

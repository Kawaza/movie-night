import { getStore } from '@netlify/blobs';
import seedData from '../default-data.json' with { type: 'json' };

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function normalizeData(body) {
  return {
    movies: Array.isArray(body?.movies) ? body.movies : [],
    people: Array.isArray(body?.people) ? body.people : [],
    updatedAt: new Date().toISOString(),
  };
}

async function readData() {
  const store = getStore({ name: 'movie-night', consistency: 'strong' });
  const existing = await store.get('data', { type: 'json' });

  if (existing !== null) {
    return existing;
  }

  const seeded = {
    movies: seedData.movies,
    people: seedData.people,
    updatedAt: new Date().toISOString(),
  };
  await store.setJSON('data', seeded);
  return seeded;
}

async function writeData(data) {
  const store = getStore({ name: 'movie-night', consistency: 'strong' });
  await store.setJSON('data', data);
}

export async function handler(event) {
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  try {
    if (method === 'GET') {
      const data = await readData();
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify(data),
      };
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const data = normalizeData(body);
      await writeData(data);
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify(data),
      };
    }

    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('Data function error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
}

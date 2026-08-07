import { getStore } from '@netlify/blobs';
import { SEED_MOVIES } from '../seed-movies.js';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function buildSeed() {
  return {
    movies: SEED_MOVIES,
    people: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(body) {
  return {
    movies: Array.isArray(body?.movies) ? body.movies : [],
    people: Array.isArray(body?.people) ? body.people : [],
    updatedAt: new Date().toISOString(),
  };
}

async function readData() {
  const seeded = buildSeed();

  try {
    const store = getStore('movie-night');
    const existing = await store.get('data', { type: 'json' });

    if (existing != null) {
      return existing;
    }

    await store.setJSON('data', seeded);
    return seeded;
  } catch (err) {
    console.error('Blob read/seed failed:', err);
    return seeded;
  }
}

async function writeData(data) {
  const store = getStore('movie-night');
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

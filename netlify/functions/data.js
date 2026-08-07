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
    watched: [],
    people: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(body) {
  return {
    movies: Array.isArray(body?.movies) ? body.movies : [],
    watched: Array.isArray(body?.watched) ? body.watched : [],
    people: Array.isArray(body?.people) ? body.people : [],
    updatedAt: new Date().toISOString(),
  };
}

async function readData(store) {
  const existing = await store.get('data', { type: 'json' });

  if (existing != null) {
    return {
      movies: Array.isArray(existing.movies) ? existing.movies : [],
      watched: Array.isArray(existing.watched) ? existing.watched : [],
      people: Array.isArray(existing.people) ? existing.people : [],
      updatedAt: existing.updatedAt ?? new Date().toISOString(),
    };
  }

  const seeded = buildSeed();
  await store.setJSON('data', seeded);
  return seeded;
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  try {
    const store = getStore('movie-night');

    if (req.method === 'GET') {
      const data = await readData(store);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: HEADERS,
      });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const data = normalizeData(body);
      await store.setJSON('data', data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: HEADERS,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: HEADERS,
    });
  } catch (err) {
    console.error('Data function error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error', message: err.message }),
      { status: 500, headers: HEADERS }
    );
  }
};

export const config = {
  path: '/api/data',
};

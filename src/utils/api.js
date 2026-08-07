const API_URL = '/api/data';

export const defaultData = () => ({
  movies: [],
  watched: [],
  people: [],
  updatedAt: null,
});

export async function fetchData() {
  const res = await fetch(API_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load data');
  const data = await res.json();
  return {
    movies: Array.isArray(data.movies) ? data.movies : [],
    watched: Array.isArray(data.watched) ? data.watched : [],
    people: Array.isArray(data.people) ? data.people : [],
    updatedAt: data.updatedAt ?? null,
  };
}

export async function saveData(data) {
  const payload = {
    movies: data.movies,
    watched: data.watched,
    people: data.people,
  };
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save data');
  return res.json();
}

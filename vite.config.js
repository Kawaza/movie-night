import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import seedData from './netlify/default-data.json' with { type: 'json' }

const DATA_PATH = path.resolve('.netlify', 'movie-night-data.json')

function getSeededData() {
  return {
    movies: seedData.movies,
    watched: [],
    people: seedData.people ?? [],
    updatedAt: new Date().toISOString(),
  }
}

function readLocalData() {
  if (!fs.existsSync(DATA_PATH)) {
    const seeded = getSeededData()
    writeLocalData(seeded)
    return seeded
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
    return {
      movies: Array.isArray(parsed.movies) ? parsed.movies : [],
      watched: Array.isArray(parsed.watched) ? parsed.watched : [],
      people: Array.isArray(parsed.people) ? parsed.people : [],
      updatedAt: parsed.updatedAt ?? null,
    }
  } catch {
    const seeded = getSeededData()
    writeLocalData(seeded)
    return seeded
  }
}

function writeLocalData(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true })
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

function movieApiPlugin() {
  return {
    name: 'movie-api',
    configureServer(server) {
      server.middlewares.use('/api/data', (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          res.end(JSON.stringify(readLocalData()))
          return
        }

        if (req.method === 'PUT') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              const data = {
                movies: Array.isArray(parsed.movies) ? parsed.movies : [],
                watched: Array.isArray(parsed.watched) ? parsed.watched : [],
                people: Array.isArray(parsed.people) ? parsed.people : [],
                updatedAt: new Date().toISOString(),
              }
              writeLocalData(data)
              res.end(JSON.stringify(data))
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), movieApiPlugin()],
})

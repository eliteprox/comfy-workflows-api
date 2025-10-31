import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const PORT = process.env.PORT || 8787
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''
const CORS_ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '*'
const DATA_FILE = process.env.DATA_FILE || path.resolve('./workflows.json')

const app = express()
app.use(express.json({ limit: '1mb' }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

async function readAll() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf-8')) } catch { return [] }
}
async function writeAll(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2))
}

function newId() { return `prompt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}` }
function requireAdmin(req, res) {
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr
  if (!ADMIN_API_KEY || token !== ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

app.get('/workflows', async (_req, res) => {
  const items = await readAll()
  res.json(items.map(w => ({ ...w, source: 'public-api' })))
})

app.post('/workflows', async (req, res) => {
  if (!requireAdmin(req, res)) return
  const { name, prompts, author, tags } = req.body || {}
  if (!name || !prompts) return res.status(400).json({ error: 'name and prompts required' })
  const now = Date.now()
  const item = { id: newId(), name, prompts, author, tags: Array.isArray(tags)?tags:[], createdAt:now, updatedAt:now }
  const items = await readAll()
  items.unshift(item)
  await writeAll(items)
  res.status(201).json(item)
})

app.put('/workflows/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return
  const { id } = req.params
  const patch = req.body || {}
  const items = await readAll()
  const i = items.findIndex(x => x.id === id)
  if (i === -1) return res.status(404).json({ error: 'not found' })
  items[i] = { ...items[i], ...patch, id, updatedAt: Date.now() }
  await writeAll(items)
  res.json(items[i])
})

app.delete('/workflows/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return
  const { id } = req.params
  const items = await readAll()
  const next = items.filter(x => x.id !== id)
  if (next.length === items.length) return res.status(404).json({ error: 'not found' })
  await writeAll(next)
  res.json({ ok: true })
})

app.listen(PORT, () => console.log(`API running on http://0.0.0.0:${PORT}`))


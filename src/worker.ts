import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { nanoid } from 'nanoid/non-secure'

type Workflow = {
  id: string
  name: string
  prompts: string
  createdAt: number
  updatedAt: number
  author?: string
  tags?: string[]
}

type Env = {
  WORKFLOWS: KVNamespace
  CORS_ALLOW_ORIGIN: string
  ADMIN_API_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: (c) => c.env?.CORS_ALLOW_ORIGIN || '*',
  allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowHeaders: ['content-type','authorization']
}))

async function readAll(env: Env): Promise<Workflow[]> {
  const raw = await env.WORKFLOWS.get('workflows:index')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

async function writeAll(env: Env, items: Workflow[]) {
  await env.WORKFLOWS.put('workflows:index', JSON.stringify(items, null, 2))
}

function requireAdmin(c: any) {
  const header = c.req.header('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  const adminKey = c.env?.ADMIN_API_KEY
  if (!adminKey || !token || token !== adminKey) return c.text('Unauthorized', 401)
  return null
}

app.get('/workflows', async (c) => {
  const items = await readAll(c.env)
  return c.json(items.map(w => ({ ...w, source: 'public-api' })))
})

app.post('/workflows', async (c) => {
  const unauth = requireAdmin(c); if (unauth) return unauth
  const body = await c.req.json<Partial<Workflow>>()
  if (!body?.name || !body?.prompts) return c.json({ error: 'name and prompts required' }, 400)
  const now = Date.now()
  const newItem: Workflow = {
    id: body.id || `prompt-${now}-${nanoid(6)}`,
    name: body.name!,
    prompts: body.prompts!,
    createdAt: now,
    updatedAt: now,
    author: body.author,
    tags: Array.isArray(body.tags) ? body.tags : []
  }
  const items = await readAll(c.env)
  items.unshift(newItem)
  await writeAll(c.env, items)
  return c.json(newItem, 201)
})

app.put('/workflows/:id', async (c) => {
  const unauth = requireAdmin(c); if (unauth) return unauth
  const { id } = c.req.param()
  const patch = await c.req.json<Partial<Workflow>>()
  let items = await readAll(c.env)
  const idx = items.findIndex(x => x.id === id)
  if (idx === -1) return c.json({ error: 'not found' }, 404)
  items[idx] = { ...items[idx], ...patch, id, updatedAt: Date.now() }
  await writeAll(c.env, items)
  return c.json(items[idx])
})

app.delete('/workflows/:id', async (c) => {
  const unauth = requireAdmin(c); if (unauth) return unauth
  const { id } = c.req.param()
  let items = await readAll(c.env)
  const next = items.filter(x => x.id !== id)
  if (next.length === items.length) return c.json({ error: 'not found' }, 404)
  await writeAll(c.env, next)
  return c.json({ ok: true })
})

export default app


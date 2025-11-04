# Comfy Workflows API

Simple API to manage and share ComfyUI workflows.

## Run locally

```bash
npm install
export ADMIN_API_KEY="super-secret"
npm start
```

## Cloudflare Worker

**Requirements:** Node.js v20.0.0 or higher

```bash
# Switch to Node 20 (if using nvm)
nvm use 20

# Login to Cloudflare
wrangler login

# The KV namespace is already configured in wrangler.toml!

# For local development, copy the example file
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set your ADMIN_API_KEY

# Test locally (uses .dev.vars automatically)
wrangler dev

# For production, set the secret (one-time setup)
wrangler secret put ADMIN_API_KEY

# Deploy to production
wrangler deploy
```

## Endpoints

* `GET /workflows` – public, lists all workflows
* `GET /workflows/:id` – public, retrieves a specific workflow
* `POST /workflows` – requires `Authorization: Bearer <ADMIN_API_KEY>`
* `PUT /workflows/:id` – requires `Authorization: Bearer <ADMIN_API_KEY>`
* `DELETE /workflows/:id` – requires `Authorization: Bearer <ADMIN_API_KEY>`

## Docker

```bash
docker build -t comfy-workflows-api .
docker run -p 8787:8787 -e ADMIN_API_KEY=super-secret comfy-workflows-api
```

## Environment Variables

- `PORT` – Server port (default: 8787)
- `ADMIN_API_KEY` – Required for write operations
- `CORS_ALLOW_ORIGIN` – CORS origin (default: *)
- `DATA_FILE` – Path to workflows JSON file (default: ./workflows.json)


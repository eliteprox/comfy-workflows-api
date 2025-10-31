#!/bin/bash

echo "🚀 Setting up Comfy Workflows API..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists, if not prompt for API key
if [ ! -f .env ]; then
  echo ""
  echo "🔐 Setting up environment for local server..."
  read -p "Enter your ADMIN_API_KEY (or press Enter for 'super-secret'): " api_key
  api_key=${api_key:-super-secret}
  
  echo "ADMIN_API_KEY=$api_key" > .env
  echo "PORT=8787" >> .env
  echo "CORS_ALLOW_ORIGIN=*" >> .env
  echo "DATA_FILE=./workflows.json" >> .env
  
  echo "✅ Created .env file"
fi

# Check if .dev.vars exists for wrangler dev
if [ ! -f .dev.vars ]; then
  echo ""
  echo "🔐 Setting up .dev.vars for Cloudflare Worker local dev..."
  read -p "Enter your ADMIN_API_KEY for wrangler dev (or press Enter for 'super-secret'): " wrangler_key
  wrangler_key=${wrangler_key:-super-secret}
  
  echo "ADMIN_API_KEY=$wrangler_key" > .dev.vars
  echo "CORS_ALLOW_ORIGIN=*" >> .dev.vars
  
  echo "✅ Created .dev.vars file"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm start         - Run local server (Express, Node 18+)"
echo "  npm run dev       - Run Cloudflare Worker locally (Node 20+)"
echo "  npm run deploy    - Deploy to Cloudflare Workers"
echo ""
echo "🧪 To test the API:"
echo "  1. Start the server: npm start (or: nvm use 20 && npm run dev)"
echo "  2. Open test.html in your browser"
echo ""
echo "🐳 Docker commands:"
echo "  docker-compose up -d    - Start with Docker Compose"
echo "  docker-compose down     - Stop Docker containers"
echo ""
echo "💡 Note: Cloudflare Worker commands require Node v20+"
echo "   Use 'nvm use 20' if you have nvm installed"
echo ""


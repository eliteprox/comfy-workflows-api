FROM node:20-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 8787

# Use node directly instead of npm to avoid signal handling issues
CMD ["node", "server.js"]


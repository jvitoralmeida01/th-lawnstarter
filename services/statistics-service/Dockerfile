FROM node:20-alpine

RUN apk add --no-cache \
    postgresql-client \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Make scripts executable
RUN chmod +x scripts/migrate.sh scripts/wait-for-db.sh

EXPOSE 8082

# Run migrations before starting the application
CMD sh -c "sh scripts/migrate.sh && node dist/index.js"

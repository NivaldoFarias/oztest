# Builder stage using Bun
FROM oven/bun:1.0.25 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Runtime stage using Node 20
FROM node:20.18-slim AS runtime

WORKDIR /app

# Copy runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV SERVER_PORT=3003

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodejs \
  && chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "dist/server.js"] 
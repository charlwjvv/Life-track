FROM node:20-alpine AS builder
WORKDIR /app

# Install backend dependencies (root package.json has all deps)
COPY package*.json ./
RUN npm ci

# Copy backend source and compile
COPY backend/ ./backend/
RUN cd backend && npx tsc

# Install webapp dependencies and build
COPY webapp/package*.json ./webapp/
RUN cd webapp && npm ci
COPY webapp/ ./webapp/
RUN cd webapp && npx vite build

# Production image
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl

# Copy compiled backend
COPY --from=builder /app/backend/dist ./backend/dist

# Copy built webapp
COPY --from=builder /app/webapp/dist ./webapp/dist

# Copy node_modules and package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "backend/dist/index.js"]

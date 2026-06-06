# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS outputs
COPY --from=builder /app/dist ./dist

# Copy static frontend assets
COPY src/dashboard/public/ ./dist/dashboard/public/
COPY profiles/ ./profiles/

EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/dashboard/server.js"]

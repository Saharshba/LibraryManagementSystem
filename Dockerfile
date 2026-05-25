# Multi-stage build: build client, then build server image that serves client

# Stage 1: build client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/ ./client/
# Install from the monorepo lockfile and build only the client workspace
RUN npm ci && npm run build --workspace=client

# Stage 2: build server
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
COPY server/ ./server/
# Copy built client dist into server for static serving
COPY --from=client-builder /app/client/dist ./client/dist
RUN cd server && npm ci --production

# Final image
FROM node:20-alpine
WORKDIR /app
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/client/dist ./client/dist
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5000
# Ensure the server serves the client
ENV SERVE_CLIENT=true
CMD ["node", "src/server.js"]

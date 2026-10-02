FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root, client, and server dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source files
COPY . .

# Build client and server
RUN cd client && npm run build
RUN cd server && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

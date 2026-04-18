# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma (needed for migrations)
COPY prisma ./prisma/

# Copy generated .next and public from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy .env if exists
COPY .env* ./

EXPOSE 3000

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

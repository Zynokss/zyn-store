FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies ignoring strict engine checks
RUN npm ci --engine-strict=false

# Copy the rest of the app code and build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
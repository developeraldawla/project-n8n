# Build Stage
FROM node:20-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-bullseye-slim

WORKDIR /app

# Copy package files and install only production deps in final image
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/scripts ./scripts # Uncomment if scripts are needed in prod

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/src/main.js"]

# =====================
# Base
# =====================
FROM node:20-alpine AS base
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/uploads

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# =====================
# Dependencies
# =====================
FROM base AS deps

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY package*.json ./
RUN npm install

# =====================
# Build
# =====================
FROM deps AS builder

COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "production" ]; then echo "Building NestJS application..." && npm run build && echo "Build completed. Checking dist folder:" && ls -la dist/; fi

# =====================
# Dev runner
# =====================
FROM deps AS dev-runner

COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# =====================
# Prod runner
# =====================
FROM base AS prod-runner

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY package*.json ./
RUN npm install --omit=dev && npm install @nestjs/cli

COPY --from=builder /usr/src/app/dist ./dist
RUN echo "Contents of dist folder:" && ls -la dist/ && echo "Checking for index.js:" && ls -la dist/index.js || echo "index.js not found"

# Copy source files for development mode
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]

# Stage 1: builder (Debian-based to avoid npm/alpine issues)
FROM node:20-bullseye AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_FAST_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_FAST_URL=${NEXT_PUBLIC_FAST_URL}

RUN npm run build

# Stage 2: runner (smaller)
FROM node:20-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]

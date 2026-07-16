# -----------------------------
# Stage 1 - Install dependencies
# -----------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Some Node packages need these Linux compatibility libraries
RUN apk add --no-cache libc6-compat

# Copy package files first (better Docker cache)
COPY package*.json ./

# Copy Prisma before npm install because postinstall runs prisma generate
COPY prisma ./prisma
COPY prisma.config.ts ./

# Fake database URL only for Prisma generation during build
ENV DATABASE_URL="postgresql://build:build@localhost:5432/schedora"

RUN npm ci

# -----------------------------
# Stage 2 - Database migrations
# -----------------------------
FROM node:22-alpine AS migrate

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

CMD ["npx", "prisma", "migrate", "deploy"]

# -----------------------------
# Stage 2 - Build the app
# -----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public environment variables needed by Next.js build
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
ARG NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL=/
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ENV DATABASE_URL="postgresql://build:build@localhost:5432/schedora"

RUN npm run build

# -----------------------------
# Stage 3 - Production Image
# -----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node","server.js"]
# HVPE Cloud Portal - Production Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci --only=production --ignore-scripts && \
    npx prisma generate

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Container labels for GitHub Container Registry
LABEL org.opencontainers.image.source="https://github.com/bickfordd-bit/hvpe-cloud-portal"
LABEL org.opencontainers.image.description="HVPE Cloud Portal - High Velocity Profit Engine by Bickford Technologies. Includes OPTR (Opportunity Targeting and Requirement Retrieval), AI-powered chat assistants, and enterprise financial tools."
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="HVPE Cloud Portal"
LABEL org.opencontainers.image.vendor="Bickford Technologies"
LABEL org.opencontainers.image.authors="Derek Bickford <bickfordd@gmail.com>"
LABEL org.opencontainers.image.url="https://github.com/bickfordd-bit/hvpe-cloud-portal"
LABEL org.opencontainers.image.documentation="https://github.com/bickfordd-bit/hvpe-cloud-portal/blob/main/README.md"
LABEL maintainer="Derek Bickford <bickfordd@gmail.com>"

# Start the application
CMD ["node", "server.js"]
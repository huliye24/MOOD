FROM node:22-bookworm-slim

# Labels for identification
LABEL org.opencontainers.image.title="MOOD Relay"
LABEL org.opencontainers.image.description="MOOD Node Federated Relay - Alpha"
LABEL org.opencontainers.image.version="0.1.0-alpha.1"
LABEL org.opencontainers.image.source="https://github.com/huliye24/MOOD"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

# Working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY src ./src

# Default environment
ENV RELAY_PORT=8080
ENV NODE_ENV=production
ENV NETWORK_ID=mood-testnet-001

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Non-root user
RUN useradd -m -u 1001 mooduser
RUN chown -R mooduser:mooduser /app
USER mooduser

# Start relay
CMD ["node", "src/relay.js"]

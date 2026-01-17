# 🦌 PORO - Taiga Adventure
# Docker container for the voxel game

FROM node:18-alpine

LABEL maintainer="RUKA-PORRO Team"
LABEL description="PORO - A voxel adventure game set in Lapland Taiga"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run the game server
CMD ["node", "src/server.js"]

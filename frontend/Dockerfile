# --- Stage 1: Build Dependencies ---
# Use a robust base for dependency installation
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
# Using 'npm ci' for clean and reliable installs
RUN npm ci --production

# --- Stage 2: Final Runtime Image ---
# Use the lighter Alpine image for the final runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Copy the production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code (assume all source files are needed)
COPY . .

# Environment variables (required for runtime secrets like MONGO_URL)
# These will be passed using the -e flag or docker-compose at runtime
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port (matches your code: 5000)
EXPOSE 5000

# Command to start the server
CMD ["node", "index.js"] 
# NOTE: Ensure your main entry file is named 'index.js' or adjust the CMD accordingly.
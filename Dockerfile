# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for database and ensure permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose the port the app runs on
EXPOSE 3002

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S portfolio -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R portfolio:nodejs /app

# Switch to non-root user
USER portfolio

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "http.get('http://localhost:3002/api/portfolio/public', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]
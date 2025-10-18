#!/bin/sh
set -e

# Docker entrypoint script for Portfolio Admin System
# Handles database initialization and permission management

echo "Starting Portfolio Admin System..."

# Ensure data directory exists and has correct permissions
if [ ! -d "/app/data" ]; then
    echo "Creating data directory..."
    mkdir -p /app/data
fi

# Set permissions for data directory
echo "Setting permissions for data directory..."
chown -R portfolio:nodejs /app/data
chmod 755 /app/data

# If portfolio.db doesn't exist in /app/data, copy or initialize it
if [ ! -f "/app/data/portfolio.db" ]; then
    echo "Database not found in /app/data..."

    # Check if there's a database in the source directory
    if [ -f "/app/portfolio.db" ]; then
        echo "Copying existing database to /app/data..."
        cp /app/portfolio.db /app/data/portfolio.db
        chown portfolio:nodejs /app/data/portfolio.db
        chmod 644 /app/data/portfolio.db
    else
        echo "No database found. It will be created on first run."
    fi
fi

# Ensure the database file has correct permissions if it exists
if [ -f "/app/data/portfolio.db" ]; then
    chown portfolio:nodejs /app/data/portfolio.db
    chmod 644 /app/data/portfolio.db
fi

# Update the DB_PATH in the application to use /app/data
export DB_PATH=/app/data/portfolio.db

echo "Database path: $DB_PATH"
echo "Switching to user 'portfolio' and starting server..."

# Drop privileges and run the server as the portfolio user
exec su-exec portfolio:nodejs node server.js

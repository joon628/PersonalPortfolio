#!/bin/sh
# Fix database permissions if it exists
if [ -f /app/portfolio.db ]; then
    chown portfolio:nodejs /app/portfolio.db
    chmod 664 /app/portfolio.db
fi
# Ensure data directory has proper permissions
chown -R portfolio:nodejs /app/data
# Drop privileges and start the application
exec su-exec portfolio npm start
#!/bin/bash
# Restart Portfolio Server Script

echo "Stopping portfolio server..."
sudo pkill -f "node server.js" || pkill -f "node server.js"

echo "Waiting for process to stop..."
sleep 2

echo "Starting portfolio server..."
cd /home/joon628/github/PersonalPortfolio
nohup node server.js > server.log 2>&1 &

echo "Server started. PID: $!"
echo "Check logs with: tail -f /home/joon628/github/PersonalPortfolio/server.log"

sleep 2
echo "Checking if server is running..."
curl -s http://localhost:3002/api/auth/status > /dev/null && echo "✓ Server is running on port 3002" || echo "✗ Server failed to start"

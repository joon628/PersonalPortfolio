#!/bin/bash

# Portfolio Admin System - Installation Script

echo "🚀 Setting up Portfolio Admin System with SQLite..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Initialize database
echo "🗄️  Initializing SQLite database..."
npm run init-db

if [ $? -eq 0 ]; then
    echo "✅ Database initialized successfully"
else
    echo "❌ Failed to initialize database"
    exit 1
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the server: npm start"
echo "   2. Open browser: http://localhost:3000"
echo "   3. Admin panel: http://localhost:3000/admin"
echo "   4. Login with: admin / portfolio2024"
echo ""
echo "🔧 Development mode: npm run dev"
echo "📖 Documentation: README.md"
echo ""
#!/bin/bash

# Simple script to start the proposal server

echo "🚀 Starting Proposal Generator Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
mkdir -p output uploads

# Start the server
echo "🌐 Server will be accessible at:"
echo "   - Local: http://localhost:3000"
echo "   - External: http://139.59.156.223:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node proposal-server.js

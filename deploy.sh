#!/bin/bash

# Deployment script for Proposal Generator
# Target Server: 139.59.156.223

set -e  # Exit on error

SERVER_IP="139.59.156.223"
SERVER_USER="root"
APP_DIR="/var/www/proposal-generator"
LOCAL_DIR="$(pwd)"

echo "🚀 Starting deployment to $SERVER_IP..."
echo "📂 Local directory: $LOCAL_DIR"

# Check if we can connect to server
echo "📡 Testing connection to server..."
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Cannot connect to server. Please check:"
    echo "   - Server IP is correct"
    echo "   - SSH key is configured"
    echo "   - Server is running"
    exit 1
fi

echo "✅ Server connection verified"

# Create directory structure on server
echo "📁 Creating directory structure..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR/output $APP_DIR/uploads"

# Sync files to server (excluding node_modules and generated files)
echo "📤 Uploading files to server..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'output/*' \
  --exclude 'uploads/*' \
  --exclude '.git' \
  --exclude '*.log' \
  $LOCAL_DIR/ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo "✅ Files uploaded successfully"

# Install dependencies and restart on server
echo "📦 Installing dependencies on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /var/www/proposal-generator

# Install dependencies
npm install

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
pm2 stop proposal-generator 2>/dev/null || true
pm2 delete proposal-generator 2>/dev/null || true

# Start the application
pm2 start proposal-server.js --name proposal-generator

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (run once)
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "✅ Application started with PM2"
pm2 status
EOF

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Access your application at:"
echo "   http://$SERVER_IP"
echo ""
echo "📊 Useful commands:"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 logs proposal-generator'    # View logs"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 restart proposal-generator' # Restart app"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 monit'                     # Monitor app"
echo ""

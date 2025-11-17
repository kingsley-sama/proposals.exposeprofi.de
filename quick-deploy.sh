#!/bin/bash

# Quick Deploy Script - Proposal Generator to 139.59.156.223

echo "🚀 Quick Deploy to 139.59.156.223..."

# Sync files
echo "📤 Syncing files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude 'output/*' \
  --exclude 'uploads/*' \
  --exclude '.git' \
  ./ root@139.59.156.223:/var/www/proposal-generator/

# Restart on server
echo "🔄 Restarting application..."
ssh root@139.59.156.223 << 'EOF'
cd /var/www/proposal-generator
npm install --production
pm2 restart proposal-generator || pm2 start proposal-server.js --name proposal-generator
pm2 save
EOF

echo ""
echo "✅ Deployment complete!"
echo "🌐 Access at: http://139.59.156.223"
echo "📊 View logs: ssh root@139.59.156.223 'pm2 logs proposal-generator'"

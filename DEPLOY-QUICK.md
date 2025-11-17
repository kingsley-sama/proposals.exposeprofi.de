# Quick Deployment Guide

## Deploy to Server (139.59.156.223)

### Quick Deploy (Updates only)
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Full Deploy (First time setup)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy Steps

1. **Sync files to server:**
```bash
rsync -avz --exclude 'node_modules' --exclude 'output/*' --exclude 'uploads/*' \
  ./ root@139.59.156.223:/var/www/proposal-generator/
```

2. **SSH into server and restart:**
```bash
ssh root@139.59.156.223
cd /var/www/proposal-generator
npm install
pm2 restart proposal-generator
```

### Access Application
- **URL:** http://139.59.156.223
- **Logs:** `ssh root@139.59.156.223 'pm2 logs proposal-generator'`
- **Status:** `ssh root@139.59.156.223 'pm2 status'`

### Troubleshooting

**Check if server is running:**
```bash
ssh root@139.59.156.223 'pm2 status'
```

**View logs:**
```bash
ssh root@139.59.156.223 'pm2 logs proposal-generator --lines 50'
```

**Restart application:**
```bash
ssh root@139.59.156.223 'pm2 restart proposal-generator'
```

**Check port 3000:**
```bash
ssh root@139.59.156.223 'netstat -tulpn | grep 3000'
```

## What Changed

✅ **Fixed API URL**: The form now automatically uses the correct server URL
   - Local: `http://localhost:3000/api/generate-proposal`
   - Production: Uses current hostname (e.g., `http://139.59.156.223/api/generate-proposal`)

The form will now work on your server without hardcoded localhost references!

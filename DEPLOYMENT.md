# Deployment Guide for Proposal Generator

## Server Details
- **IP Address**: 139.59.156.223
- **Application**: Proposal Generator (DOCX)

## Prerequisites on Server

1. **Node.js** (v16 or higher)
2. **npm** 
3. **PM2** (for process management)

## Deployment Steps

### 1. Connect to Server
```bash
ssh root@139.59.156.223
```

### 2. Install Prerequisites (if not already installed)
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install nginx (for reverse proxy)
apt install -y nginx
```

### 3. Create Application Directory
```bash
# Create directory
mkdir -p /var/www/proposal-generator
cd /var/www/proposal-generator

# Create necessary subdirectories
mkdir -p output uploads
```

### 4. Upload Files to Server

From your local machine, run:
```bash
# Navigate to your project directory
cd /home/kingsley-sama/property-visualizer/document-draft_proposals

# Upload files to server (use rsync)
rsync -avz --exclude 'node_modules' --exclude 'output/*' --exclude 'uploads/*' \
  ./ root@139.59.156.223:/var/www/proposal-generator/
```

### 5. Install Dependencies on Server
```bash
# SSH into server
ssh root@139.59.156.223

# Navigate to app directory
cd /var/www/proposal-generator

# Install dependencies
npm install
```

### 6. Start Application with PM2
```bash
# Start the server with PM2
pm2 start proposal-server.js --name proposal-generator

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 7. Configure Nginx (Reverse Proxy)

Create nginx configuration:
```bash
nano /etc/nginx/sites-available/proposal-generator
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 139.59.156.223;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/proposal-generator /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

# Reload nginx
systemctl reload nginx
```

### 8. Configure Firewall
```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 9. Access the Application

Open in browser:
```
http://139.59.156.223
```

## PM2 Management Commands

```bash
# View logs
pm2 logs proposal-generator

# Restart application
pm2 restart proposal-generator

# Stop application
pm2 stop proposal-generator

# View status
pm2 status

# Monitor
pm2 monit
```

## Update/Redeploy

To update the application:
```bash
# From local machine
cd /home/kingsley-sama/property-visualizer/document-draft_proposals
rsync -avz --exclude 'node_modules' --exclude 'output/*' --exclude 'uploads/*' \
  ./ root@139.59.156.223:/var/www/proposal-generator/

# On server
ssh root@139.59.156.223
cd /var/www/proposal-generator
npm install
pm2 restart proposal-generator
```

## Optional: Setup SSL with Let's Encrypt

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain if you have one)
# certbot --nginx -d yourdomain.com

# Certificates auto-renew via cron
```

## Troubleshooting

### Check if Node.js is running
```bash
pm2 status
pm2 logs proposal-generator
```

### Check nginx status
```bash
systemctl status nginx
nginx -t
```

### Check firewall
```bash
ufw status
```

### Check application logs
```bash
cd /var/www/proposal-generator
pm2 logs proposal-generator --lines 100
```

### Restart everything
```bash
pm2 restart proposal-generator
systemctl restart nginx
```

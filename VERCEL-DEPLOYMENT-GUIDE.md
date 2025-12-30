# Vercel Deployment Quick Start

This guide will help you deploy your Next.js Proposal Generator to Vercel with automatic deployments.

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- Your Supabase credentials ready

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Convert to Next.js with Vercel deployment config"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js

### 3. Configure Project Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Add Environment Variables

In the Vercel dashboard, go to your project → Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
supabase_url=https://your-project.supabase.co
supabase_key=your-anon-key-here
```

**Note**: The duplicate variables (`supabase_url`, `supabase_key`) are for backward compatibility with existing code.

### 5. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy to production
- Provide you with a URL (e.g., `your-app.vercel.app`)

## Automatic Deployments

Once deployed, any push to your repository will trigger automatic deployments:

### Branch Configuration

- **`main` branch** → Production deployment at `your-app.vercel.app`
- **Other branches** → Preview deployments at `branch-name-your-app.vercel.app`
- **Pull Requests** → Preview deployments with unique URLs

### Deployment Workflow

```
1. You push code to GitHub
   ↓
2. Vercel detects the push (via webhook)
   ↓
3. Vercel builds your app
   ↓
4. If build succeeds → Deploy
   ↓
5. If build fails → No deployment (current version stays live)
```

## Vercel Configuration Explained

Your `vercel.json` file contains:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "github": {
    "enabled": true,
    "autoAlias": true,
    "silent": false,
    "autoJobCancelation": true
  }
}
```

**What this does:**
- `builds`: Tells Vercel to use the Next.js builder
- `env`: Maps Vercel secrets to environment variables (you can configure secrets in Vercel dashboard)
- `github.enabled`: Enables GitHub integration
- `github.autoAlias`: Automatically creates preview URLs
- `github.autoJobCancelation`: Cancels outdated builds when you push again

## Custom Domain Setup

### Adding a Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `proposals.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

### DNS Configuration

Vercel will provide you with DNS records to add:

**Option A: Using Subdomain**
```
Type: CNAME
Name: proposals
Value: cname.vercel-dns.com
```

**Option B: Using Root Domain**
```
Type: A
Name: @
Value: 76.76.21.21
```

## Monitoring & Logs

### Viewing Deployment Logs

1. Go to your project in Vercel dashboard
2. Click on "Deployments"
3. Click on any deployment
4. View "Building" and "Runtime Logs"

### Common Log Locations

- **Build Logs**: Shows npm install and build output
- **Runtime Logs**: Shows API route executions and errors
- **Function Logs**: Shows serverless function invocations

### Real-time Function Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs in real-time
vercel logs --follow
```

## Environment Variables Management

### Updating Environment Variables

1. Go to Project Settings → Environment Variables
2. Click on variable to edit
3. Update value
4. **Important**: Redeploy for changes to take effect

### Environment Scopes

- **Production**: Used for `main` branch deployments
- **Preview**: Used for branch and PR deployments
- **Development**: Used when running `vercel dev` locally

**Tip**: Set different Supabase projects for production and preview!

## Rollback & Version Management

### Rolling Back a Deployment

1. Go to Deployments tab
2. Find the previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm

### Instant Rollback

Vercel keeps all previous deployments live, so you can instantly rollback without rebuilding.

## Performance Optimization

### Vercel Analytics

Enable Vercel Analytics to monitor:
- Page load times
- Core Web Vitals
- Real user metrics

Enable in: Project Settings → Analytics

### Edge Caching

Your static files and API responses can be cached at the edge for better performance:

```javascript
// In your API routes, add cache headers
export default function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  // ... your code
}
```

## Troubleshooting

### Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test build locally: `npm run build`

### Environment Variables Not Working

**Solutions:**
1. Verify variable names are exact (case-sensitive)
2. Check scope (Production/Preview/Development)
3. Redeploy after changing variables

### API Routes Return 404

**Check:**
1. File is in `pages/api/` directory
2. File naming is correct (lowercase, no special chars except `-` and `_`)
3. Export default function is present

### Function Timeout

Vercel has execution time limits:
- **Hobby**: 10 seconds
- **Pro**: 60 seconds

If your DOCX generation takes too long, consider:
1. Optimizing image processing
2. Upgrading to Pro plan
3. Moving heavy processing to background jobs

## Vercel CLI Commands

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Pull environment variables
vercel env pull

# Link local project to Vercel
vercel link
```

## Security Best Practices

### Protecting API Routes

```javascript
// Add rate limiting
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    // Enable CORS only for specific domains
  },
};
```

### Secret Management

- Never commit `.env` files
- Use Vercel environment variables for secrets
- Rotate Supabase keys periodically

## Cost Management

### Vercel Pricing Tiers

- **Hobby (Free)**:
  - Perfect for this project
  - 100GB bandwidth/month
  - Unlimited deployments
  - Community support

- **Pro ($20/month)**:
  - 1TB bandwidth
  - 60s function timeout
  - Priority support
  - Advanced analytics

### Monitor Usage

Check Project Settings → Usage to track:
- Bandwidth usage
- Build minutes
- Function invocations

## Next Steps

After deployment:

1. ✅ Test all functionality on production URL
2. ✅ Set up custom domain (optional)
3. ✅ Enable Vercel Analytics
4. ✅ Configure alerts for deployment failures
5. ✅ Document your production URL for your team

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/vercel/vercel/issues)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Need help?** Check the main [README.md](./README.md) or open an issue.

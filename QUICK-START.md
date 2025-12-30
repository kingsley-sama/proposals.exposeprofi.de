# 🚀 Quick Start Guide

Get your Next.js Proposal Generator running in 5 minutes!

## Local Development (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials
# You need: SUPABASE_URL and SUPABASE_ANON_KEY
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Go to: http://localhost:3000

That's it! You're running locally. 🎉

---

## Vercel Deployment (3 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Step 3: Access Your App
Vercel will give you a URL like: `https://your-app.vercel.app`

Done! Your app is live. 🚀

---

## Automatic Deployments

Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys if build succeeds
4. Sends you a notification

No manual deployments needed! 🎯

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production Build
npm run build            # Build for production
npm start                # Run production build locally

# Legacy Express Server
npm run server           # Run old Express server (backward compatibility)

# Setup
./setup.sh              # Run automated setup script
```

---

## File Structure at a Glance

```
your-project/
├── pages/              # Next.js pages & API routes
│   ├── api/           # Backend API endpoints
│   └── *.js           # Frontend pages
├── public/            # Static files (HTML, images, etc.)
├── styles/            # CSS files
├── .env.local         # Your local environment variables
└── vercel.json        # Vercel deployment config
```

---

## Environment Variables

You need these in `.env.local` (local) and Vercel Dashboard (production):

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

---

## Testing Your Deployment

### Local Testing
1. Fill out the proposal form
2. Click "Preview"
3. Generate DOCX document
4. Verify download works

### Production Testing
Same steps, but on your Vercel URL!

---

## Troubleshooting

### Build Failed?
- Check Vercel deployment logs
- Verify all dependencies in `package.json`
- Test locally: `npm run build`

### Environment Variables Not Working?
- Verify exact names (case-sensitive!)
- Redeploy after adding variables
- Check they're set for "Production" environment

### Can't Access Supabase?
- Verify credentials are correct
- Check Supabase project is active
- Test connection with Supabase dashboard

---

## Next Steps

1. ✅ Customize the proposal templates in `public/`
2. ✅ Update service descriptions in `service_description.js`
3. ✅ Configure your custom domain (optional)
4. ✅ Enable Vercel Analytics for insights

---

## Need More Help?

- 📖 [Full README](./README.md)
- 🚀 [Deployment Guide](./VERCEL-DEPLOYMENT-GUIDE.md)
- ✅ [Migration Checklist](./MIGRATION-CHECKLIST.md)

---

**Happy coding!** 💻✨

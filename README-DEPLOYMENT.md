# Next.js Proposal Generator - Deployment Guide

This is a [Next.js](https://nextjs.org/) application for generating client proposals with document export functionality.

## Getting Started

### Development

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment to Vercel

### Prerequisites
1. Create a [Vercel account](https://vercel.com)
2. Install the [Vercel CLI](https://vercel.com/cli) (optional)

### Deploy via Git Integration (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Convert to Next.js app"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

6. Add Environment Variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add `SUPABASE_URL`
   - Add `SUPABASE_ANON_KEY`
   - Add any other required variables

7. Click "Deploy"

### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Auto-Deployment

The `vercel.json` configuration enables automatic deployments:
- Every push to your main branch triggers a production deployment
- Pull requests create preview deployments
- Failed builds won't be deployed

## Project Structure

```
├── pages/
│   ├── api/              # API routes (Next.js serverless functions)
│   │   ├── config.js     # Supabase config endpoint
│   │   ├── config-js.js  # Dynamic config.js endpoint
│   │   ├── generate-proposal.js  # Proposal generation endpoint
│   │   └── client-lookup/
│   │       └── [clientNumber].js  # Client lookup endpoint
│   ├── _app.js           # Custom App component
│   ├── _document.js      # Custom Document component
│   ├── index.js          # Home page (proposal form)
│   ├── preview.js        # Preview page
│   └── main.js           # Main template page
├── public/               # Static files
│   ├── main.html
│   ├── preview.html
│   └── proposal-form.html
├── styles/
│   └── globals.css       # Global styles
├── lib/                  # Utility functions and libraries
├── output/               # Generated documents (not in git)
├── uploads/              # Uploaded files (not in git)
├── next.config.js        # Next.js configuration
├── vercel.json           # Vercel deployment configuration
└── package.json          # Dependencies and scripts
```

## API Routes

- `GET /api/config` - Get Supabase configuration
- `GET /api/config-js` - Get dynamic JavaScript config
- `GET /api/client-lookup/[clientNumber]` - Lookup client by number
- `POST /api/generate-proposal` - Generate proposal document

## Features

- ✅ Next.js 14 with React 18
- ✅ Server-side API routes
- ✅ Static file serving
- ✅ Automatic deployments on push
- ✅ Environment variable management
- ✅ DOCX document generation
- ✅ Supabase integration
- ✅ Client lookup functionality
- ✅ Image handling with base64 encoding

## Learn More

To learn more about Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Vercel Deployment Documentation](https://vercel.com/docs)

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

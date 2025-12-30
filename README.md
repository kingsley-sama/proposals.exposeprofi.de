# Proposal Generator - Next.js App

A modern web-based proposal generator application built with Next.js for creating professional business proposals with dynamic content and DOCX export functionality. Optimized for deployment on Vercel with automatic CI/CD.

## 🚀 Features

- 📝 Interactive proposal form with service selection
- 🎨 Real-time preview with editable fields
- 📄 DOCX document generation
- 🖼️ Image upload and embedding
- 💰 Dynamic pricing with tiered options
- 🔄 Auto-save functionality
- 📊 Supabase integration for data persistence
- ⚡ Server-side rendering with Next.js
- 🔄 Automatic deployment on push to Vercel
- 🌐 Serverless API routes

## 🏗️ Tech Stack

- **Framework**: Next.js 14
- **Runtime**: React 18
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: Supabase
- **Deployment**: Vercel
- **Document Generation**: docx library

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Access the application:**
```
http://localhost:3000
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Alternative variable names (if needed for compatibility)
supabase_url=your_supabase_project_url
supabase_key=your_supabase_anon_key

# Next.js Public Variables
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run server` - Run the legacy Express server (for backward compatibility)

## 📁 Project Structure

```
├── pages/
│   ├── api/                    # API routes (serverless functions)
│   │   ├── config.js          # Supabase config endpoint
│   │   ├── config-js.js       # Dynamic config.js endpoint
│   │   ├── generate-proposal.js  # Proposal generation
│   │   └── client-lookup/
│   │       └── [clientNumber].js  # Client lookup by ID
│   ├── _app.js                # Custom App component
│   ├── _document.js           # Custom Document component
│   ├── index.js               # Home page (proposal form)
│   ├── preview.js             # Preview page
│   └── main.js                # Main template page
├── public/                     # Static files
│   ├── main.html              # HTML templates
│   ├── preview.html
│   ├── proposal-form.html
│   └── logo_2.png             # Logo and assets
├── styles/
│   └── globals.css            # Global CSS styles
├── lib/                       # Utility functions and libraries
├── output/                    # Generated documents (not tracked in git)
├── uploads/                   # Uploaded files (not tracked in git)
├── next.config.js             # Next.js configuration
├── vercel.json                # Vercel deployment configuration
├── .env.example               # Environment variables template
└── package.json               # Dependencies and scripts
```

## 🌐 API Routes

All API routes are serverless functions deployed on Vercel:

- `GET /api/config` - Get Supabase configuration (JSON)
- `GET /api/config-js` - Get dynamic JavaScript config for client
- `GET /api/client-lookup/[clientNumber]` - Lookup client by number
- `POST /api/generate-proposal` - Generate proposal DOCX document

## 🚢 Deployment to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Convert to Next.js app with Vercel config"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables:**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add the following variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `supabase_url` (if needed)
     - `supabase_key` (if needed)

4. **Deploy:**
   - Click "Deploy"
   - Every push to `main` branch will trigger automatic deployment

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Automatic Deployments

The `vercel.json` configuration enables:
- ✅ Automatic production deployments on push to main branch
- ✅ Preview deployments for pull requests
- ✅ Auto-cancellation of outdated builds
- ✅ Environment variable management

## 🔄 CI/CD Pipeline

When you push changes to your repository:

1. **Vercel detects the push** via GitHub webhook
2. **Builds your Next.js app** using `npm run build`
3. **Runs tests** (if configured)
4. **Deploys to production** or creates a preview
5. **Updates your domain** automatically

### Branch Configuration

- `main` branch → Production deployment
- Other branches → Preview deployments
- Pull requests → Automatic preview URLs

## 💾 Database Setup

### Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `database-schema.sql`
3. Copy your project URL and anon key
4. Add to `.env.local` for development
5. Add to Vercel environment variables for production

## 🧪 Testing

### Local Development

```bash
# Run development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/config
```

### Building for Production

```bash
# Create production build
npm run build

# Test production build locally
npm start
```

## 🐛 Troubleshooting

### Build Errors on Vercel

**Issue**: Build fails with module errors

**Solution**: 
1. Ensure all dependencies are in `package.json`
2. Check that `next.config.js` is properly configured
3. Verify Node.js version compatibility (use Node 18+)

### Environment Variables Not Working

**Issue**: API returns undefined for Supabase config

**Solution**:
1. Check variable names match exactly in Vercel dashboard
2. Redeploy after adding environment variables
3. Verify variables are set for "Production" environment

### API Routes Return 404

**Issue**: `/api/*` routes not found

**Solution**:
1. Ensure API route files are in `pages/api/` directory
2. Check file naming convention (use lowercase, kebab-case)
3. Verify `vercel.json` build configuration

### Static Files Not Loading

**Issue**: Images or HTML files return 404

**Solution**:
1. Move static files to `public/` directory
2. Reference them with `/filename` (not `/public/filename`)
3. Check `.vercelignore` isn't excluding needed files

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Detailed Deployment Guide](./README-DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally with `npm run dev`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Deployment Guide](./README-DEPLOYMENT.md)
- Review Vercel deployment logs

---

**Built with ❤️ using Next.js and deployed on Vercel**

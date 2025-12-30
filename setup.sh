#!/bin/bash

# Next.js Proposal Generator - Setup Script
# This script helps you set up the project for development or deployment

echo "🚀 Setting up Next.js Proposal Generator..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    
    if [ -f .env.example ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "✅ .env.local created"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env.local and add your:"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_ANON_KEY"
        echo ""
    else
        echo "❌ .env.example not found. Please create .env.local manually."
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "To deploy to Vercel:"
echo "1. Push your code to GitHub"
echo "2. Connect your repo to Vercel"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""

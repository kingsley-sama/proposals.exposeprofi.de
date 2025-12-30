#!/bin/bash

# First Deployment Script
# This script guides you through your first deployment to Vercel

echo "🚀 First Deployment to Vercel - Step by Step Guide"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "Let's initialize it now..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 You have uncommitted changes. Let's commit them..."
    echo ""
    echo "Files to be committed:"
    git status -s
    echo ""
    
    read -p "Enter commit message (or press Enter for default): " commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Migrated to Next.js with Vercel deployment config"
    fi
    
    git add .
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
    echo ""
else
    echo "✅ No uncommitted changes"
    echo ""
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "You need to create it for local development"
    echo ""
    
    read -p "Create .env.local now? (y/n): " create_env
    
    if [ "$create_env" = "y" ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.local
            echo "✅ Created .env.local from .env.example"
            echo "⚠️  Remember to add your Supabase credentials!"
        else
            echo "❌ .env.example not found"
        fi
    fi
    echo ""
fi

# Check for remote repository
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  No Git remote configured"
    echo ""
    echo "You need to:"
    echo "1. Create a repository on GitHub"
    echo "2. Add it as remote:"
    echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
    echo ""
    
    read -p "Enter your GitHub repository URL (or press Enter to skip): " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Remote repository added"
        echo ""
    else
        echo "⏭️  Skipped. You can add it later with:"
        echo "   git remote add origin <your-repo-url>"
        echo ""
    fi
fi

# Push to GitHub
echo "📤 Ready to push to GitHub?"
echo ""

read -p "Push to GitHub now? (y/n): " push_now

if [ "$push_now" = "y" ]; then
    # Check if main branch exists
    if ! git show-ref --quiet refs/heads/main; then
        echo "Creating main branch..."
        git branch -M main
    fi
    
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub"
    else
        echo "❌ Failed to push to GitHub"
        echo "Make sure you have:"
        echo "1. Created a GitHub repository"
        echo "2. Set up GitHub authentication"
        echo "3. Added the correct remote URL"
    fi
    echo ""
fi

# Vercel CLI check
echo "🔍 Checking for Vercel CLI..."
echo ""

if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    echo ""
    
    read -p "Deploy to Vercel now? (y/n): " deploy_now
    
    if [ "$deploy_now" = "y" ]; then
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo ""
        
        vercel --prod
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Deployment successful!"
            echo ""
            echo "⚠️  Don't forget to:"
            echo "1. Add environment variables in Vercel dashboard"
            echo "2. Redeploy after adding environment variables"
        else
            echo ""
            echo "❌ Deployment failed"
            echo "Check the error messages above"
        fi
    fi
else
    echo "⚠️  Vercel CLI not installed"
    echo ""
    echo "You have two options:"
    echo ""
    echo "Option 1: Install Vercel CLI and deploy from terminal"
    echo "   npm i -g vercel"
    echo "   vercel --prod"
    echo ""
    echo "Option 2: Deploy via Vercel Dashboard (Recommended for first time)"
    echo "   1. Go to https://vercel.com"
    echo "   2. Click 'New Project'"
    echo "   3. Import your GitHub repository"
    echo "   4. Add environment variables:"
    echo "      - SUPABASE_URL"
    echo "      - SUPABASE_ANON_KEY"
    echo "   5. Click Deploy"
    echo ""
fi

echo ""
echo "=================================================="
echo "📋 Next Steps Summary:"
echo "=================================================="
echo ""
echo "1. ✅ Code committed to Git"
if git remote get-url origin &> /dev/null; then
    echo "2. ✅ Git remote configured"
else
    echo "2. ⏭️  Add Git remote (see instructions above)"
fi
if [[ -n $(git branch -r) ]]; then
    echo "3. ✅ Pushed to GitHub"
else
    echo "3. ⏭️  Push to GitHub (git push origin main)"
fi
echo "4. ⏭️  Deploy to Vercel (see options above)"
echo "5. ⏭️  Add environment variables in Vercel"
echo "6. ⏭️  Test your production deployment"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - QUICK-START.md"
echo "   - VERCEL-DEPLOYMENT-GUIDE.md"
echo "   - MIGRATION-SUMMARY.md"
echo ""
echo "🎉 Good luck with your deployment!"
echo ""

#!/bin/bash

# Script to safely clean .env files from git history
# Created by Claude Code

set -e  # Exit on error

echo "🧹 Git History Cleanup Script"
echo "=============================="
echo ""

# Get repo directory
REPO_DIR="/Users/bestflow/Documents/projects/active/bizflow-website"
cd "$REPO_DIR"

echo "📍 Working directory: $REPO_DIR"
echo ""

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "Please commit or stash them first:"
    echo "  git add ."
    echo "  git commit -m 'Save current work'"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="$HOME/Desktop/bizflow-backup-$(date +%Y%m%d-%H%M%S)"
cp -r "$REPO_DIR" "$BACKUP_DIR"
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Show files that will be removed from history
echo "🔍 Files to remove from history:"
git log --all --pretty=format: --name-only --diff-filter=A | grep -E '\.env$|\.env\.' | sort -u
echo ""
echo ""

read -p "❓ Remove these files from git history? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Run BFG to remove .env files
echo "🚀 Running BFG Repo Cleaner..."
echo ""

bfg --delete-files '.env' --delete-files '*.env' --no-blob-protection

echo ""
echo "🧹 Cleaning up..."

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "📤 Next step: Force push to GitHub"
echo ""
echo "⚠️  WARNING: This will rewrite public history!"
echo "Run this command:"
echo ""
echo "  git push --force --all"
echo ""
read -p "Push now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to remote..."
    git push --force --all
    echo ""
    echo "✅ Done!"
else
    echo "⏸️  Skipped push. Run manually when ready:"
    echo "  git push --force --all"
fi

echo ""
echo "✅ Cleanup complete!"
echo "Backup saved at: $BACKUP_DIR"

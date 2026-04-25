#!/bin/bash

# Launch Pixel AI Agent - Quick Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Launch Pixel AI Agent - Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if required tools are installed
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi
print_success "Node.js installed: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm installed: $(npm --version)"

if ! command -v wrangler &> /dev/null; then
    print_warning "Wrangler CLI not found. Installing..."
    npm install -g wrangler
    print_success "Wrangler installed"
fi

echo ""
echo "Select deployment target:"
echo "1) Backend Worker (Cloudflare Worker)"
echo "2) Frontend (Cloudflare Pages)"
echo "3) Both (Worker + Frontend)"
echo "4) Local Development Setup"
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying Backend Worker..."
        cd backend-worker
        
        print_info "Installing dependencies..."
        npm install
        
        print_warning "Make sure you've set secrets using 'wrangler secret put <KEY>'"
        read -p "Have you set all required secrets? (y/n): " secrets_set
        
        if [ "$secrets_set" != "y" ]; then
            print_error "Please set secrets first. See DEPLOYMENT.md for instructions."
            exit 1
        fi
        
        print_info "Deploying to Cloudflare Workers..."
        wrangler deploy
        
        print_success "Backend Worker deployed successfully!"
        echo ""
        print_info "Next steps:"
        echo "  1. Copy the Worker URL from the output above"
        echo "  2. Configure Twilio webhook to point to: <WORKER_URL>/twiml"
        echo "  3. Test health endpoint: curl <WORKER_URL>/health"
        ;;
        
    2)
        echo ""
        echo "🎨 Deploying Frontend..."
        cd frontend
        
        print_info "Installing dependencies..."
        npm install
        
        print_info "Building for production..."
        npm run build
        
        if [ ! -d "out" ]; then
            print_error "Build failed. Check for errors above."
            exit 1
        fi
        
        print_success "Build completed successfully!"
        
        print_info "Deploying to Cloudflare Pages..."
        npx wrangler pages deploy out --project-name=launchpixel-ai-agent
        
        print_success "Frontend deployed successfully!"
        echo ""
        print_info "Next steps:"
        echo "  1. Configure environment variables in Cloudflare Pages dashboard"
        echo "  2. Add custom domain (optional)"
        echo "  3. Test the dashboard at the URL shown above"
        ;;
        
    3)
        echo ""
        echo "🚀 Deploying Both Worker and Frontend..."
        
        # Deploy Worker first
        echo ""
        echo "📦 Step 1/2: Deploying Backend Worker..."
        cd backend-worker
        npm install
        wrangler deploy
        cd ..
        
        print_success "Backend Worker deployed!"
        
        # Deploy Frontend
        echo ""
        echo "🎨 Step 2/2: Deploying Frontend..."
        cd frontend
        npm install
        npm run build
        npx wrangler pages deploy out --project-name=launchpixel-ai-agent
        cd ..
        
        print_success "Both deployments completed successfully!"
        echo ""
        print_info "Next steps:"
        echo "  1. Configure Twilio webhook"
        echo "  2. Set environment variables in Cloudflare Pages"
        echo "  3. Test the complete flow"
        ;;
        
    4)
        echo ""
        echo "🛠️  Setting up Local Development Environment..."
        
        # Backend Worker
        echo ""
        print_info "Setting up Backend Worker..."
        cd backend-worker
        
        if [ ! -f ".dev.vars" ]; then
            print_warning ".dev.vars not found. Creating from example..."
            cp .dev.vars.example .dev.vars
            print_info "Please edit backend-worker/.dev.vars with your credentials"
        else
            print_success ".dev.vars already exists"
        fi
        
        npm install
        print_success "Backend Worker dependencies installed"
        cd ..
        
        # Frontend
        echo ""
        print_info "Setting up Frontend..."
        cd frontend
        
        if [ ! -f ".env.local" ]; then
            print_warning ".env.local not found. Creating from example..."
            cp .env.example .env.local
            print_info "Please edit frontend/.env.local with your credentials"
        else
            print_success ".env.local already exists"
        fi
        
        npm install
        print_success "Frontend dependencies installed"
        cd ..
        
        echo ""
        print_success "Local development setup complete!"
        echo ""
        print_info "To start development:"
        echo "  Terminal 1: cd backend-worker && wrangler dev"
        echo "  Terminal 2: cd frontend && npm run dev"
        echo ""
        print_info "Then open: http://localhost:3000"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
print_success "Deployment process completed!"
echo ""
print_info "For detailed instructions, see DEPLOYMENT.md"
print_info "For troubleshooting, check the logs or contact support"
echo ""

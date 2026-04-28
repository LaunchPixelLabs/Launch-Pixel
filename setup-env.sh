#!/bin/bash

# Setup Environment Variables Script
# This script helps you create the .env.local file with your Firebase configuration

set -e

echo "🔥 Firebase Configuration Setup for lpcall-722c9"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you create frontend/.env.local${NC}"
echo ""

# Check if .env.local already exists
if [ -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists!${NC}"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Aborted. Keeping existing .env.local"
        exit 0
    fi
fi

echo ""
echo "📋 Please provide your Firebase configuration values:"
echo "   (Get them from: https://console.firebase.google.com/u/0/project/lpcall-722c9/settings/general)"
echo ""

# Firebase Configuration
read -p "Firebase API Key: " FIREBASE_API_KEY
read -p "Firebase Messaging Sender ID: " FIREBASE_SENDER_ID
read -p "Firebase App ID: " FIREBASE_APP_ID

echo ""
echo "📋 Please provide your other API keys:"
echo ""

# Other APIs
read -p "ElevenLabs API Key: " ELEVENLABS_API_KEY
read -p "Twilio Account SID (optional, press Enter to skip): " TWILIO_ACCOUNT_SID
read -p "Twilio Auth Token (optional, press Enter to skip): " TWILIO_AUTH_TOKEN

echo ""
echo "📋 Worker URL (leave default for local development):"
echo ""
read -p "Worker URL [http://localhost:8787]: " WORKER_URL
WORKER_URL=${WORKER_URL:-http://localhost:8787}

# Create .env.local
cat > frontend/.env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lpcall-722c9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lpcall-722c9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lpcall-722c9.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Cloudflare Worker URL
NEXT_PUBLIC_WORKER_URL=${WORKER_URL}

# ElevenLabs Configuration
ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}

# Twilio Configuration (for WhatsApp notifications)
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
EOF

echo ""
echo -e "${GREEN}✅ Created frontend/.env.local successfully!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Verify the values in frontend/.env.local"
echo "   2. Add authorized domains in Firebase Console:"
echo "      https://console.firebase.google.com/u/0/project/lpcall-722c9/authentication/settings"
echo "   3. Start development server: cd frontend && npm run dev"
echo "   4. Test authentication: http://localhost:3000/call/auth"
echo ""

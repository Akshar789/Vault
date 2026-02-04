#!/bin/bash

# =============================================================================
# Environment Setup Helper Script
# =============================================================================

echo "🔐 Zero-Knowledge Vault - Environment Setup"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Copy from example
cp .env.example .env.local

echo ""
echo "📝 Please provide the following information:"
echo ""

# Supabase
echo -e "${GREEN}1. SUPABASE POSTGRESQL${NC}"
echo "   Get from: https://app.supabase.com/project/_/settings/database"
read -p "   Supabase Project Ref (e.g., abcdefghijklmnop): " SUPABASE_REF
read -sp "   Supabase Database Password: " SUPABASE_PASSWORD
echo ""

# Upstash Redis
echo ""
echo -e "${GREEN}2. UPSTASH REDIS${NC}"
echo "   Get from: https://console.upstash.io > Your Database > Redis Connect"
read -p "   Redis Endpoint (e.g., concrete-starling-63465.upstash.io): " REDIS_ENDPOINT
read -sp "   Redis Password: " REDIS_PASSWORD
echo ""

# Generate JWT secrets
echo ""
echo -e "${GREEN}3. GENERATING JWT SECRETS${NC}"
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo "   ✓ JWT secrets generated"

# Update .env.local
echo ""
echo -e "${GREEN}4. UPDATING .env.local${NC}"

# Database URL
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:${SUPABASE_PASSWORD}@db.${SUPABASE_REF}.supabase.co:5432/postgres|g" .env.local
sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=postgresql://postgres:${SUPABASE_PASSWORD}@db.${SUPABASE_REF}.supabase.co:5432/postgres|g" .env.local

# Redis URL
sed -i.bak "s|REDIS_URL=.*|REDIS_URL=rediss://default:${REDIS_PASSWORD}@${REDIS_ENDPOINT}:6379|g" .env.local

# JWT Secrets
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env.local
sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|g" .env.local

# Clean up backup files
rm -f .env.local.bak

echo "   ✓ Configuration updated"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review .env.local and adjust any settings"
echo "2. Run database migrations: npm run migrate"
echo "3. Start development server: npm run dev"
echo ""

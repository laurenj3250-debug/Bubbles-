#!/bin/bash

# Bubbles Status Checker
# Quick health check of all components

# ⚠️ SECURITY WARNING ⚠️
# This script uses default admin credentials for testing purposes.
# These credentials are for LOCAL DEVELOPMENT ONLY and MUST BE CHANGED in production!
# 
# To use custom credentials, set the following environment variables:
#   export BUBBLES_TEST_ADMIN_USER="your_username"
#   export BUBBLES_TEST_ADMIN_PASSWORD="your_secure_password"
#
# NEVER use default credentials in production environments!

echo "🔍 Bubbles System Status"
echo "========================"
echo ""

# Admin credentials - use environment variables or fall back to defaults
# ⚠️ DEFAULT CREDENTIALS ARE FOR TESTING ONLY - CHANGE IN PRODUCTION!
ADMIN_USER="${BUBBLES_TEST_ADMIN_USER:-admin}"
ADMIN_PASSWORD="${BUBBLES_TEST_ADMIN_PASSWORD:-admin123}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Backend
echo -n "Backend API (port 3000)... "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    response=$(curl -s http://localhost:3000/health)
    db_status=$(echo $response | jq -r '.database' 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ Running${NC} (Database: $db_status)"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Check Database File
echo -n "SQLite Database... "
if [ -f "backend/bubbles.db" ]; then
    size=$(du -h backend/bubbles.db | cut -f1)
    echo -e "${GREEN}✓ Exists${NC} (Size: $size)"
else
    echo -e "${YELLOW}⚠ Not found${NC} (Will be created on first run)"
fi

# Check Firebase Config
echo -n "Firebase Config (backend)... "
if [ -f "backend/firebase-service-account.json" ]; then
    echo -e "${GREEN}✓ Found${NC}"
elif [ ! -z "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then
    echo -e "${GREEN}✓ From env var${NC}"
else
    echo -e "${YELLOW}⚠ Not configured${NC} (Real-time features disabled)"
fi

# Check Mobile Dependencies
echo -n "Mobile Dependencies... "
if [ -d "mobile/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC} (Run: cd mobile && npm install)"
fi

# Check Backend Dependencies
echo -n "Backend Dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC} (Run: cd backend && npm install)"
fi

# Check Git Status
echo -n "Git Status... "
if [ -d ".git" ]; then
    branch=$(git branch --show-current)
    echo -e "${GREEN}✓ Branch: ${branch}${NC}"
else
    echo -e "${YELLOW}⚠ Not a git repository${NC}"
fi

# Check Admin Panel
echo -n "Admin Panel... "
if [ -f "backend/public/admin.html" ]; then
    echo -e "${GREEN}✓ Available${NC} (http://localhost:3000/admin.html)"
else
    echo -e "${RED}✗ Not found${NC}"
fi

echo ""
echo "========================"
echo "Environment Variables"
echo "========================"
echo ""

# Check critical env vars
echo -n "NODE_ENV... "
if [ -z "$NODE_ENV" ]; then
    echo -e "${YELLOW}not set${NC} (defaults to development)"
else
    echo -e "${GREEN}$NODE_ENV${NC}"
fi

echo -n "DATABASE_URL... "
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}not set${NC} (using SQLite)"
else
    echo -e "${GREEN}configured${NC} (PostgreSQL)"
fi

echo -n "JWT_SECRET... "
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}not set${NC} (using default - NOT for production!)"
else
    echo -e "${GREEN}configured${NC}"
fi

echo -n "ADMIN_PASSWORD... "
if [ -z "$BUBBLES_TEST_ADMIN_PASSWORD" ]; then
    echo -e "${YELLOW}not set${NC} (using default: admin123 - ⚠️ CHANGE IN PRODUCTION!)"
else
    echo -e "${GREEN}configured${NC}"
fi

echo ""
echo "========================"
echo "Quick Actions"
echo "========================"
echo ""

echo "Start Backend:"
echo "  ${BLUE}cd backend && npm start${NC}"
echo ""

echo "Start Web App:"
echo "  ${BLUE}cd mobile && npm run web${NC}"
echo ""

echo "Run Tests:"
echo "  ${BLUE}./test-all.sh${NC}"
echo ""

echo "View Logs:"
echo "  ${BLUE}tail -f /tmp/bubbles-backend.log${NC}"
echo ""

echo "Admin Panel:"
echo "  ${BLUE}http://localhost:3000/admin.html${NC}"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASSWORD"
echo "  ${YELLOW}⚠️  SECURITY: Change these credentials in production!${NC}"
echo ""

# Database Stats (if backend is running)
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "========================"
    echo "Database Statistics"
    echo "========================"
    echo ""

    # Try to get stats if admin is accessible
    stats=$(curl -s -u "$ADMIN_USER:$ADMIN_PASSWORD" http://localhost:3000/api/admin/stats 2>/dev/null)
    if [ ! -z "$stats" ]; then
        echo "Users:        $(echo $stats | jq -r '.stats.users' 2>/dev/null || echo '?')"
        echo "Partnerships: $(echo $stats | jq -r '.stats.partnerships' 2>/dev/null || echo '?')"
        echo "Locations:    $(echo $stats | jq -r '.stats.location_signals' 2>/dev/null || echo '?')"
        echo "Capsules:     $(echo $stats | jq -r '.stats.capsules' 2>/dev/null || echo '?')"
    fi
    echo ""
fi

echo "========================"
echo "Recent Commits"
echo "========================"
echo ""
git log --oneline -5 2>/dev/null || echo "Git not initialized"
echo ""

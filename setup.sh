#!/bin/bash

# Bubbles Quick Setup Script
# Installs all dependencies and prepares for testing

echo "🚀 Bubbles Setup"
echo "================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend

if npm install; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..

# Install mobile dependencies
echo ""
echo "📱 Installing mobile dependencies..."
cd mobile

if npm install; then
    echo -e "${GREEN}✓ Mobile dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install mobile dependencies${NC}"
    exit 1
fi

cd ..

# Create .env file if it doesn't exist
echo ""
echo "⚙️  Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env with defaults..."
    cat > backend/.env << 'EOF'
# Backend Environment Configuration
PORT=3000
NODE_ENV=development

# Database (leave blank for SQLite, set for PostgreSQL)
# DATABASE_URL=

# JWT Secret (change in production!)
JWT_SECRET=dev-secret-change-in-production

# Admin Password (default: admin123)
ADMIN_PASSWORD=admin123

# Firebase Realtime Database
FIREBASE_DATABASE_URL=https://sugarbum-d19a8-default-rtdb.firebaseio.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:19006
EOF
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}ℹ backend/.env already exists${NC}"
fi

# Test setup
echo ""
echo "🧪 Testing setup..."
echo -n "Starting backend server... "

cd backend
npm start > /tmp/bubbles-setup-test.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for server
for i in {1..15}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    sleep 1
done

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is working!${NC}"

    # Quick API test
    echo -n "Testing API endpoints... "
    if curl -s http://localhost:3000/health | grep -q "healthy"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    echo "Check /tmp/bubbles-setup-test.log for errors"
fi

# Stop test server
kill $BACKEND_PID 2>/dev/null

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Start the backend:"
echo "   ${GREEN}cd backend && npm start${NC}"
echo ""
echo "2. In another terminal, start the web app:"
echo "   ${GREEN}cd mobile && npm run web${NC}"
echo ""
echo "3. Or run automated tests:"
echo "   ${GREEN}./test-all.sh${NC}"
echo ""
echo "4. Access admin panel:"
echo "   ${BLUE}http://localhost:3000/admin.html${NC}"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "5. Read the testing guide:"
echo "   ${GREEN}cat README_TESTING.md${NC}"
echo ""

echo "================================"
echo "Quick Reference"
echo "================================"
echo ""
echo "Check status:    ./check-status.sh"
echo "Run all tests:   ./test-all.sh"
echo "API tests only:  ./test-api.sh"
echo ""

echo -e "${GREEN}Happy coding! 🎉${NC}"

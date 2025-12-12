#!/bin/bash

# Complete Bubbles Test Runner
# Starts backend and runs all tests

echo "🚀 Bubbles Complete Test Suite"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backend is running
echo -n "Checking backend status... "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    BACKEND_STARTED=false
else
    echo -e "${YELLOW}⚠ Not running${NC}"
    echo ""
    echo "Starting backend server..."
    cd backend
    npm start > /tmp/bubbles-backend.log 2>&1 &
    BACKEND_PID=$!
    BACKEND_STARTED=true

    # Wait for server to start
    echo -n "Waiting for server to be ready"
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e " ${RED}✗${NC}"
        echo "Failed to start backend. Check /tmp/bubbles-backend.log"
        exit 1
    fi
    cd ..
fi

echo ""
echo "================================"
echo "Running API Tests..."
echo "================================"
echo ""

./test-api.sh
TEST_RESULT=$?

# Cleanup
if [ "$BACKEND_STARTED" = true ]; then
    echo ""
    echo "Stopping backend server..."
    kill $BACKEND_PID 2>/dev/null
fi

echo ""
echo "================================"
echo "Manual Testing Instructions"
echo "================================"
echo ""
echo "Backend API: ${GREEN}✓ Tested${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Test Web App:"
echo "   cd mobile && npm run web"
echo ""
echo "2. Test Mobile (iOS/Android):"
echo "   cd mobile && npm run ios"
echo ""
echo "3. Access Admin Panel:"
echo "   http://localhost:3000/admin.html"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "4. See full testing guide:"
echo "   cat TESTING_GUIDE.md"
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC} 🎉"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check output above.${NC}"
    exit 1
fi

#!/bin/bash

# Bubbles API Quick Test Script
# Tests backend endpoints to verify everything works

echo "🧪 Bubbles API Test Suite"
echo "=========================="
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Testing: $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

# Test 1: Health Check
test_endpoint "Health Check" "$BASE_URL/health" "200"

# Test 2: Admin Panel HTML
test_endpoint "Admin Panel" "$BASE_URL/admin.html" "200"

# Test 3: Protected Route (should fail without auth)
test_endpoint "Protected Route (no auth)" "$BASE_URL/api/partners/current" "401"

# Test 4: Register User
echo -n "Testing: User Registration... "
# Create a secure temp file with restrictive permissions (600 = owner read/write only)
temp_file=$(mktemp)
chmod 600 "$temp_file"

response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "email": "test-'$(date +%s)'@example.com",
        "password": "testpass123"
    }' \
    -w "%{http_code}" -o "$temp_file")

if [ "$response" == "201" ]; then
    TOKEN=$(jq -r '.token' "$temp_file")
    USER_ID=$(jq -r '.user.id' "$temp_file")
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response, Token: ${TOKEN:0:20}...)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 201, got $response)"
    ((FAILED++))
    TOKEN=""
fi

# Securely remove temp file immediately after use
rm -f "$temp_file"

# Test 5: Login
if [ ! -z "$TOKEN" ]; then
    echo -n "Testing: User Login... "
    # Extract email from USER_ID test - we need to capture it during registration
    # Create a secure temp file for login test
    temp_login_file=$(mktemp)
    chmod 600 "$temp_login_file"
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test User Login",
            "email": "test-login-'$(date +%s)'@example.com",
            "password": "testpass123"
        }' \
        -w "%{http_code}" -o "$temp_login_file")
    
    if [ "$response" == "201" ]; then
        email=$(jq -r '.user.email' "$temp_login_file")
        rm -f "$temp_login_file"
        
        response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$email\",
                \"password\": \"testpass123\"
            }" \
            -w "%{http_code}" -o /dev/null)

        if [ "$response" == "200" ]; then
            echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC} (Expected 200, got $response)"
            ((FAILED++))
        fi
    else
        rm -f "$temp_login_file"
        echo -e "${RED}✗ FAIL${NC} (Could not create test user for login)"
        ((FAILED++))
    fi
fi

# Test 6: Authenticated Request
if [ ! -z "$TOKEN" ]; then
    echo -n "Testing: Authenticated Request... "
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$BASE_URL/api/auth/me" \
        -w "%{http_code}" -o /dev/null)

    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected 200, got $response)"
        ((FAILED++))
    fi
fi

# Test 7: Admin Panel Auth
echo -n "Testing: Admin Panel (with auth)... "
response=$(curl -s -u "admin:admin123" \
    "$BASE_URL/api/admin/health" \
    -w "%{http_code}" -o /dev/null)

if [ "$response" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARN${NC} (Admin password may need to be set)"
fi

# Test 8: SQL Injection Prevention
echo -n "Testing: SQL Injection Prevention... "
response=$(curl -s -u "admin:admin123" \
    "$BASE_URL/api/admin/table/users;DROP%20TABLE%20users" \
    -w "%{http_code}" -o /dev/null)

if [ "$response" == "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Injection blocked)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Should block SQL injection)"
    ((FAILED++))
fi

# Summary
echo ""
echo "=========================="
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC} 🎉"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

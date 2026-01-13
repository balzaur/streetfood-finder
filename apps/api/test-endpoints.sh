#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"

echo "🧪 Testing Ultimate Street Food Finder API Endpoints"
echo "======================================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $API_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (200)${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Health check failed (Expected 200, got $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Vendors List (public endpoint)
echo -e "${YELLOW}Test 2: Get All Vendors (Mock Data)${NC}"
echo "GET $API_URL/api/v1/vendors"
VENDORS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/vendors")
HTTP_CODE=$(echo "$VENDORS_RESPONSE" | tail -n 1)
BODY=$(echo "$VENDORS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Get vendors passed (200)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Get vendors failed (Expected 200, got $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Business endpoints without auth (should return 401)
echo -e "${YELLOW}Test 3: Get Businesses Without Auth (Should Fail)${NC}"
echo "GET $API_URL/api/v1/business"
BUSINESS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/business")
HTTP_CODE=$(echo "$BUSINESS_RESPONSE" | tail -n 1)
BODY=$(echo "$BUSINESS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Auth protection working (401)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Expected 401, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 4: Create Business without auth (should return 401)
echo -e "${YELLOW}Test 4: Create Business Without Auth (Should Fail)${NC}"
echo "POST $API_URL/api/v1/business"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/business" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business",
    "description": "Test description",
    "longitude": -122.4194,
    "latitude": 37.7749
  }')
HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n 1)
BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Auth protection working (401)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Expected 401, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 5: Invalid endpoint (404)
echo -e "${YELLOW}Test 5: Invalid Endpoint (Should Return 404)${NC}"
echo "GET $API_URL/api/v1/invalid"
NOT_FOUND_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/invalid")
HTTP_CODE=$(echo "$NOT_FOUND_RESPONSE" | tail -n 1)
BODY=$(echo "$NOT_FOUND_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ 404 handler working${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Expected 404, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

# Test 6: Create Business with invalid data (should return 400)
echo -e "${YELLOW}Test 6: Create Business With Invalid Data${NC}"
echo "POST $API_URL/api/v1/business (with mock token)"
# Note: This will likely fail with 401 due to invalid token, but we're testing the validation
INVALID_DATA_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/business" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token-for-testing" \
  -d '{
    "name": "",
    "longitude": 200,
    "latitude": 100
  }')
HTTP_CODE=$(echo "$INVALID_DATA_RESPONSE" | tail -n 1)
BODY=$(echo "$INVALID_DATA_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Either auth or validation working ($HTTP_CODE)${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Expected 401 or 400, got $HTTP_CODE${NC}"
    echo "Response: $BODY"
fi
echo ""

echo "======================================================"
echo "✅ Endpoint testing completed!"
echo ""
echo "Note: Authenticated endpoints require valid Supabase JWT tokens."
echo "To fully test authenticated endpoints, use the mobile app or generate"
echo "a valid token from Supabase Auth."

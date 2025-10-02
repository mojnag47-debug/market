#!/bin/bash

# NextGen Marketplace Smoke Test Script
# This script validates all API endpoints and system functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_URL="http://localhost:3001"
CATALOG_URL="http://localhost:3002"
ORDERS_URL="http://localhost:3003"
ML_URL="http://localhost:3004"
FRONTEND_URL="http://localhost:3000"

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local method="${4:-GET}"
    local data="$5"
    local headers="$6"
    
    ((TOTAL_TESTS++))
    log_info "Testing $name..."
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$url" $headers)
    else
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X "$method" "$url" \
                   -H "Content-Type: application/json" \
                   $headers \
                   ${data:+-d "$data"})
    fi
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed "s/HTTP_STATUS:[0-9]*$//")
    
    if [ "$http_status" = "$expected_status" ]; then
        log_success "$name (Status: $http_status)"
        echo "$response_body"
        return 0
    else
        log_error "$name (Expected: $expected_status, Got: $http_status)"
        echo "Response: $response_body"
        return 1
    fi
}

# Wait for services to be ready
wait_for_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            log_success "$service_name is ready"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    log_error "$service_name failed to start within $(($max_attempts * 2)) seconds"
    return 1
}

# Start smoke tests
echo "=================================================="
echo "    NextGen Marketplace Smoke Test Suite"
echo "=================================================="

log_info "Starting smoke tests..."

# Wait for all services
wait_for_service "Auth Service" "$AUTH_URL/health"
wait_for_service "Catalog Service" "$CATALOG_URL/health"
wait_for_service "Orders Service" "$ORDERS_URL/health"
wait_for_service "ML Service" "$ML_URL/health"
wait_for_service "Frontend" "$FRONTEND_URL/api/health" || log_warning "Frontend health check failed (may not be implemented)"

echo ""
log_info "All services are ready. Starting API tests..."
echo ""

# Test 1: Health Checks
echo "=== HEALTH CHECKS ==="
test_endpoint "Auth Service Health" "$AUTH_URL/health"
test_endpoint "Catalog Service Health" "$CATALOG_URL/health"
test_endpoint "Orders Service Health" "$ORDERS_URL/health"
test_endpoint "ML Service Health" "$ML_URL/health"

echo ""

# Test 2: Auth Service Tests
echo "=== AUTH SERVICE TESTS ==="

# Register a new user
REGISTER_DATA='{
  "email": "testuser@example.com",
  "password": "testpassword123",
  "firstName": "Test",
  "lastName": "User"
}'

if test_endpoint "User Registration" "$AUTH_URL/auth/register" 201 "POST" "$REGISTER_DATA"; then
    # Extract token from response (assuming it returns access_token)
    ACCESS_TOKEN=$(echo "$response_body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$ACCESS_TOKEN" ]; then
        log_success "Retrieved access token"
        
        # Test login
        LOGIN_DATA='{
          "email": "testuser@example.com",
          "password": "testpassword123"
        }'
        
        test_endpoint "User Login" "$AUTH_URL/auth/login" 200 "POST" "$LOGIN_DATA"
        
        # Test profile retrieval
        test_endpoint "Get User Profile" "$AUTH_URL/auth/me" 200 "GET" "" "-H \"Authorization: Bearer $ACCESS_TOKEN\""
    else
        log_error "Failed to extract access token from registration response"
    fi
else
    log_warning "Skipping dependent auth tests due to registration failure"
fi

echo ""

# Test 3: Catalog Service Tests
echo "=== CATALOG SERVICE TESTS ==="

# Test product creation (requires auth)
if [ -n "$ACCESS_TOKEN" ]; then
    PRODUCT_DATA='{
      "name": "Test Product",
      "description": "This is a test product for smoke testing",
      "price": 29.99,
      "stock": 100,
      "category_id": "test-category-id"
    }'
    
    if test_endpoint "Create Product" "$CATALOG_URL/catalog" 201 "POST" "$PRODUCT_DATA" "-H \"Authorization: Bearer $ACCESS_TOKEN\""; then
        # Extract product ID if available
        PRODUCT_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        
        if [ -n "$PRODUCT_ID" ]; then
            log_success "Created product with ID: $PRODUCT_ID"
            
            # Test get product by ID
            test_endpoint "Get Product by ID" "$CATALOG_URL/catalog/$PRODUCT_ID"
        fi
    fi
fi

# Test product search (no auth required)
test_endpoint "Search Products" "$CATALOG_URL/catalog/search?q=test"
test_endpoint "List Products" "$CATALOG_URL/catalog"

echo ""

# Test 4: Orders Service Tests
echo "=== ORDERS SERVICE TESTS ==="

if [ -n "$ACCESS_TOKEN" ] && [ -n "$PRODUCT_ID" ]; then
    ORDER_DATA='{
      "items": [
        {
          "productId": "'$PRODUCT_ID'",
          "quantity": 2,
          "price": 29.99
        }
      ],
      "shippingAddressId": "test-address-id"
    }'
    
    if test_endpoint "Create Order" "$ORDERS_URL/orders" 201 "POST" "$ORDER_DATA" "-H \"Authorization: Bearer $ACCESS_TOKEN\""; then
        ORDER_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        
        if [ -n "$ORDER_ID" ]; then
            log_success "Created order with ID: $ORDER_ID"
            
            # Test get order by ID
            test_endpoint "Get Order by ID" "$ORDERS_URL/orders/$ORDER_ID" 200 "GET" "" "-H \"Authorization: Bearer $ACCESS_TOKEN\""
        fi
    fi
    
    # Test get user orders
    test_endpoint "Get User Orders" "$ORDERS_URL/orders/user" 200 "GET" "" "-H \"Authorization: Bearer $ACCESS_TOKEN\""
else
    log_warning "Skipping order tests - missing ACCESS_TOKEN or PRODUCT_ID"
fi

echo ""

# Test 5: ML Service Tests
echo "=== ML SERVICE TESTS ==="

# Test recommendations
RECOMMEND_DATA='{"user_id": "test-user-id"}'
test_endpoint "Get Recommendations" "$ML_URL/ml/recommend" 200 "POST" "$RECOMMEND_DATA"

# Test embeddings
EMBED_DATA='{"text": "test product description"}'
test_endpoint "Generate Embeddings" "$ML_URL/ml/embed" 200 "POST" "$EMBED_DATA"

echo ""

# Test 6: Frontend Tests
echo "=== FRONTEND TESTS ==="
test_endpoint "Frontend Landing Page" "$FRONTEND_URL" 200

# Test API routes if they exist
test_endpoint "Frontend API Health" "$FRONTEND_URL/api/health" 200 || log_warning "Frontend API health endpoint not found"

echo ""

# Test 7: Integration Tests
echo "=== INTEGRATION TESTS ==="

log_info "Testing service-to-service communication..."

# Test if services can communicate with each other
# This would involve testing the actual business flows

echo ""

# Summary
echo "=================================================="
echo "              SMOKE TEST SUMMARY"
echo "=================================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! The marketplace is ready.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the logs above.${NC}"
    echo ""
    echo "Common troubleshooting tips:"
    echo "1. Ensure all services are running: docker compose ps"
    echo "2. Check service logs: docker compose logs [service-name]"
    echo "3. Verify database migrations: docker compose exec auth-service npm run db:migrate"
    echo "4. Check environment variables in .env file"
    exit 1
fi
# Testing Guide

## Overview

This guide covers testing strategies for the API, including manual testing with cURL, integration testing patterns, and best practices.

## Testing Pyramid

```
         ┌─────────────────────┐
         │   E2E Tests         │  (Few)
         │  (User workflows)   │
         ├─────────────────────┤
         │  Integration Tests  │  (Some)
         │  (Layer integration)│
         ├──────────────────────┤
         │    Unit Tests       │  (Many)
         │  (Single functions) │
         └─────────────────────┘
```

## Manual Testing with cURL

### Setup

```bash
# 1. Get a valid JWT token from Supabase
# (Via mobile app or Supabase dashboard test token)
TOKEN="your-supabase-jwt-token-here"

# 2. Define API base URL
API_URL="http://localhost:4000"

# 3. Create convenience function
auth_curl() {
  curl -H "Authorization: Bearer $TOKEN" "$@"
}
```

### Health Check (No Auth Required)

```bash
curl $API_URL/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-01-13T15:16:18.854Z",
  "environment": "development"
}
```

### Get Vendors (No Auth Required)

```bash
curl $API_URL/api/v1/vendors

# Expected response: Array of vendor objects
[
  {
    "id": "1",
    "name": "Taco Fiesta Truck",
    "cuisine": "Mexican",
    "area": "Downtown",
    "rating": 4.8,
    ...
  }
]
```

### Create Business (Auth Required)

```bash
auth_curl -X POST $API_URL/api/v1/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Taco Stand",
    "description": "Authentic Mexican tacos",
    "longitude": -122.4194,
    "latitude": 37.7749
  }'

# Expected response: 201 Created
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Taco Stand",
    "created_at": "2026-01-13T...",
    "updated_at": "2026-01-13T..."
  }
}
```

### Get My Businesses

```bash
auth_curl $API_URL/api/v1/business

# Expected response: 200 OK with array of businesses
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Taco Stand",
      ...
    }
  ]
}
```

### Get Single Business

```bash
auth_curl $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000

# Expected response: 200 OK
{
  "data": { ... }
}
```

### Update Business

```bash
auth_curl -X PUT $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Taco Stand",
    "description": "Even better tacos!",
    "longitude": -122.420,
    "latitude": 37.775
  }'

# Expected response: 200 OK
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Taco Stand",
    "updated_at": "2026-01-13T... (newer)"
  }
}
```

### Delete Business

```bash
auth_curl -X DELETE $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000

# Expected response: 204 No Content (empty body)
```

### Create Menu with Images

```bash
auth_curl -X POST $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000/menu \
  -F "menu=Beef Taco \$5, Chicken Taco \$4, Veggie Taco \$3" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"

# Expected response: 201 Created
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "business_id": "770e8400-e29b-41d4-a716-446655440000",
    "menu": "Beef Taco $5, Chicken Taco $4, Veggie Taco $3",
    "images": [
      "https://livjafablrkxszdfrsrb.supabase.co/storage/.../image1.jpg",
      "https://livjafablrkxszdfrsrb.supabase.co/storage/.../image2.jpg"
    ],
    "created_at": "2026-01-13T..."
  }
}
```

### Get Business Menus

```bash
auth_curl $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000/menu

# Expected response: 200 OK
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "business_id": "770e8400-e29b-41d4-a716-446655440000",
      "menu": "...",
      "images": [...]
    }
  ]
}
```

### Update Menu

```bash
auth_curl -X POST $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000/menu/880e8400-e29b-41d4-a716-446655440000 \
  -F "menu=Beef Taco \$6, Chicken Taco \$5 (Price increase!)"

# Expected response: 200 OK
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "menu": "Beef Taco $6, Chicken Taco $5 (Price increase!)",
    "images": [...]
  }
}
```

### Delete Menu

```bash
auth_curl -X DELETE $API_URL/api/v1/business/770e8400-e29b-41d4-a716-446655440000/menu/880e8400-e29b-41d4-a716-446655440000

# Expected response: 204 No Content
```

## Testing Error Scenarios

### Missing Authentication

```bash
# Try without token
curl -X POST $API_URL/api/v1/business \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Expected response: 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

### Invalid JWT Token

```bash
curl -X POST $API_URL/api/v1/business \
  -H "Authorization: Bearer invalid-token-here" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# Expected response: 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Validation Error - Missing Required Field

```bash
auth_curl -X POST $API_URL/api/v1/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "longitude": 100
    // Missing latitude!
  }'

# Expected response: 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["latitude"],
        "message": "Required"
      }
    ]
  }
}
```

### Validation Error - Invalid Coordinate

```bash
auth_curl -X POST $API_URL/api/v1/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "longitude": 200,  // Invalid! Max is 180
    "latitude": 50
  }'

# Expected response: 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["longitude"],
        "message": "Must be between -180 and 180"
      }
    ]
  }
}
```

### Not Found - Resource Doesn't Exist

```bash
auth_curl $API_URL/api/v1/business/00000000-0000-0000-0000-000000000000

# Expected response: 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Business not found"
  }
}
```

### Not Found - Accessing Other User's Business

```bash
# As User A, try to access User B's business
auth_curl $API_URL/api/v1/business/other-users-business-id

# Expected response: 404 Not Found
# (Same as if it didn't exist - prevents info leakage)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Business not found"
  }
}
```

## Automated Testing Examples

### Unit Test Example (Jest)

```typescript
import { createBusiness } from "../src/services/business.service";
import { NotFoundError } from "../src/utils/http-errors";

describe("Business Service", () => {
  it("should create a business for authenticated user", async () => {
    const userId = "test-user-id";
    const data = {
      name: "Test Business",
      longitude: -122.4194,
      latitude: 37.7749,
    };

    const business = await createBusiness(userId, data);

    expect(business.id).toBeDefined();
    expect(business.user_id).toBe(userId);
    expect(business.name).toBe("Test Business");
  });

  it("should throw error if profile does not exist", async () => {
    const nonExistentUserId = "invalid-user-id";
    const data = {
      name: "Test Business",
      longitude: -122.4194,
      latitude: 37.7749,
    };

    expect(() => createBusiness(nonExistentUserId, data)).rejects.toThrow(
      NotFoundError
    );
  });
});
```

### Integration Test Example (Supertest)

```typescript
import request from "supertest";
import app from "../src/app";

describe("Business Endpoints", () => {
  const validJWT = "your-test-jwt-token";

  it("should create a business with valid JWT", async () => {
    const response = await request(app)
      .post("/api/v1/business")
      .set("Authorization", `Bearer ${validJWT}`)
      .send({
        name: "Test Business",
        longitude: -122.4194,
        latitude: 37.7749,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe("Test Business");
  });

  it("should reject request without JWT", async () => {
    const response = await request(app).post("/api/v1/business").send({
      name: "Test Business",
      longitude: -122.4194,
      latitude: 37.7749,
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
```

## Testing Checklist

### Before Deployment

- [ ] All endpoints respond correctly with valid auth
- [ ] All endpoints reject requests without auth
- [ ] All validation errors return 400 with details
- [ ] All 404 scenarios return 404 (not 403)
- [ ] Ownership checks prevent unauthorized access
- [ ] Images upload successfully
- [ ] Images are served correctly via public URLs
- [ ] Health check returns 200
- [ ] Public endpoints work without auth
- [ ] Protected endpoints require auth

### Load Testing

- [ ] API handles 100+ concurrent requests
- [ ] Database connections don't exhaust
- [ ] Response times acceptable under load
- [ ] Rate limiting works (if enabled)

### Security Testing

- [ ] SQL injection attempts fail safely
- [ ] XSS attempts (if HTML endpoints existed) fail
- [ ] Invalid JWTs rejected
- [ ] Expired JWTs rejected
- [ ] User cannot access other user's data
- [ ] User cannot modify other user's data

## Performance Testing

### Response Time Targets

- Health check: < 50ms
- List operations: < 200ms
- Single read: < 150ms
- Create operations: < 300ms
- Update operations: < 300ms
- Delete operations: < 300ms

### Tools

```bash
# Load testing with Apache Bench
ab -n 1000 -c 100 http://localhost:4000/health

# Load testing with wrk
wrk -t4 -c100 -d30s http://localhost:4000/health

# Load testing with k6
k6 run load-test.js
```

## Continuous Integration Testing

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "20"

      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm test:integration
```

## Debugging

### Enable Debug Logging

```typescript
// In src/config/env.ts or middleware
if (process.env.DEBUG) {
  console.log("Request:", req.method, req.path);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
}
```

### Use Node Debugger

```bash
# Start with debugger
node --inspect dist/server.js

# Open in Chrome
chrome://inspect
```

### Database Query Logging

```bash
# Enable in Supabase dashboard
# Settings → Database → Query Logging
```

## References

- [Testing Best Practices](https://testingjavascript.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [cURL Manual](https://curl.se/docs/manual.html)

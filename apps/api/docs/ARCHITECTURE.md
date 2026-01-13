# Backend Architecture

## System Overview

The Ultimate Street Food Finder API follows a **layered, clean architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Requests                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Routes & Routing                            │
│  (Express Route Definitions & Middleware Mounting)      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Middleware Layer                            │
│  ├── Authentication (Supabase JWT Verification)        │
│  ├── Validation (Zod Schemas)                          │
│  ├── Error Handling                                    │
│  └── Async Error Wrapping                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│             Controllers (HTTP Layer)                     │
│  ├── Request Parsing                                   │
│  ├── Call Business Logic                              │
│  └── Response Formatting                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│             Services (Business Logic)                    │
│  ├── CRUD Operations                                   │
│  ├── Data Validation                                   │
│  ├── Business Rules Enforcement                        │
│  └── Error Handling                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Data Access Layer (Repositories)                │
│  ├── Supabase Client                                   │
│  ├── Database Queries                                  │
│  └── Error Translation                                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Supabase (PostgreSQL)                       │
│  ├── Profiles Table                                    │
│  ├── Business Table                                    │
│  ├── Menu Table                                        │
│  └── Auth System (auth.users)                          │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app.ts                    # Express app setup, middleware configuration
├── server.ts                 # Server initialization & startup
│
├── config/
│   └── env.ts               # Environment variables with validation
│
├── controllers/             # HTTP Request Handlers
│   ├── health.controller.ts     # Health check
│   ├── vendor.controller.ts     # Vendor listing (public)
│   ├── business.controller.ts   # Business CRUD (authenticated)
│   └── menu.controller.ts       # Menu CRUD (authenticated)
│
├── services/                # Business Logic Layer
│   ├── vendor.service.ts       # Vendor data (mock)
│   ├── business.service.ts     # Business CRUD logic
│   └── menu.service.ts         # Menu CRUD logic
│
├── routes/                  # Express Route Definitions
│   ├── index.ts               # Route mounting
│   ├── health.routes.ts       # GET /health
│   ├── vendor.routes.ts       # GET /api/v1/vendors
│   ├── business.routes.ts     # /api/v1/business routes
│   └── menu.routes.ts         # /api/v1/business/:id/menu routes
│
├── middlewares/             # Express Middleware
│   ├── auth.middleware.ts      # Supabase JWT verification
│   ├── async-handler.ts        # Async error wrapping
│   ├── error.middleware.ts     # Centralized error handling
│   └── validate.middleware.ts  # Request validation
│
├── validators/              # Zod Validation Schemas
│   └── index.ts               # All validation schemas
│
├── utils/                   # Utility Functions
│   ├── http-errors.ts         # Custom error classes
│   └── api-response.ts        # Response formatting (optional)
│
└── lib/                     # External Service Clients
    └── supabase.ts           # Supabase admin client
```

## Request Flow Example

### Creating a Business (POST /api/v1/business)

```
1. CLIENT: Sends HTTP request
   POST /api/v1/business
   Headers: Authorization: Bearer <jwt>
   Body: { name, description, longitude, latitude }

2. ROUTES: Route matches /api/v1/business -> POST handler

3. MIDDLEWARE: Applied in order
   a) requireAuth: Verifies JWT, attaches userId to req
   b) validateBody(createBusinessSchema): Validates request body

4. CONTROLLER: business.controller.ts::createBusiness()
   ├─ Extracts req.userId (from auth middleware)
   ├─ Calls businessService.createBusiness(userId, data)
   └─ Formats response with sendCreated()

5. SERVICE: business.service.ts::createBusiness()
   ├─ Validates profile exists
   ├─ Constructs insert data with user_id = userId
   ├─ Calls supabaseAdmin.from('business').insert()
   ├─ Returns created business object
   └─ Throws custom errors on failure

6. DATABASE: Supabase PostgreSQL
   ├─ INSERT INTO business (user_id, name, ...)
   ├─ Validates foreign key: user_id → profiles.id
   ├─ Returns created row with id, timestamps
   └─ Returns to service layer

7. SERVICE: Returns created business to controller

8. CONTROLLER: Formats response and sends to client
   Response: 201 Created
   Body: { data: { id, user_id, name, ... } }
```

## Layer Responsibilities

### Routes Layer

- **Responsibility**: HTTP routing and endpoint definitions
- **Input**: Express route definitions
- **Output**: Routes to controllers
- **Concerns**: URL patterns, HTTP methods, middleware mounting
- **Files**: `routes/*.ts`

### Middleware Layer

- **Responsibility**: Cross-cutting concerns before reaching controllers
- **Input**: HTTP requests
- **Output**: Modified requests, responses, or pass to next middleware
- **Concerns**: Authentication, validation, error handling
- **Files**: `middlewares/*.ts`

### Controllers Layer

- **Responsibility**: HTTP request/response handling
- **Input**: HTTP requests (parsed by middleware)
- **Output**: HTTP responses
- **Concerns**: Request parsing, response formatting, HTTP status codes
- **Files**: `controllers/*.ts`
- **Rule**: Keep logic minimal, delegate to services

### Services Layer

- **Responsibility**: Business logic and data operations
- **Input**: Validated data from controllers
- **Output**: Domain objects (Business, Menu, etc.)
- **Concerns**: CRUD operations, business rules, data validation
- **Files**: `services/*.ts`
- **Rule**: No HTTP knowledge, pure business logic

### Data Layer

- **Responsibility**: Database operations
- **Input**: Query parameters, data objects
- **Output**: Database results
- **Tools**: Supabase JavaScript client
- **Location**: Service layer (services make queries directly)

## Design Patterns

### 1. Async Error Handling

```typescript
// Wrap async route handlers to catch errors
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await service.getAll();
    res.json(items);
    // Any thrown errors are caught by async-handler
    // and passed to error.middleware.ts
  })
);
```

### 2. Custom Error Classes

```typescript
// Typed errors for different scenarios
throw new NotFoundError("Business not found");
throw new UnauthorizedError("Invalid token");
throw new ValidationError("Field required");
// Error middleware maps to HTTP status codes
```

### 3. Ownership Verification

```typescript
// Service layer enforces ownership before any mutation
export const updateBusiness = async (
  businessId: string,
  userId: string, // From JWT
  updates: UpdateBusinessData
) => {
  // Verify ownership - throws 404 if doesn't exist or not owned
  await getBusinessById(businessId, userId);

  // Proceed with update
  return supabaseAdmin
    .from("business")
    .update(updates)
    .eq("id", businessId)
    .eq("user_id", userId) // Additional safety
    .select()
    .single();
};
```

### 4. Type Safety

```typescript
// Controllers use typed requests
type AuthRequest = Request & { userId: string };

export const createBusiness = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // req.userId is guaranteed to exist
    const business = await businessService.createBusiness(req.userId, req.body);
  }
);
```

### 5. Response Consistency

```typescript
// All success responses follow pattern
{
  "data": { /* actual data */ }
}

// All error responses follow pattern
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Error Handling Flow

```
1. Application Layer (Controller/Service) throws error
   throw new NotFoundError("Business not found");

2. Async Handler Catches Error
   asyncHandler wraps route handler, catches thrown errors

3. Error Middleware Processes Error
   error.middleware.ts receives error object
   ├─ Maps custom error to HTTP status code
   ├─ Extracts error message
   ├─ Logs error details
   └─ Sends JSON response

4. Response Sent to Client
   Status: 404
   Body: { error: { code: "NOT_FOUND", message: "Business not found" } }
```

## Authentication & Authorization Flow

```
1. Frontend: User logs in via Supabase Auth
   ├─ Facebook OAuth flow
   ├─ Returns JWT token
   └─ Stores in session

2. Frontend: API request includes JWT
   Headers: Authorization: Bearer <jwt>

3. Backend: Auth Middleware
   ├─ Extracts token from header
   ├─ Verifies token with Supabase
   ├─ Gets user from JWT
   ├─ Creates/ensures profile exists
   └─ Attaches userId to request

4. Backend: Route Handler
   ├─ Can access req.userId (guaranteed to exist)
   ├─ Passes userId to service layer
   └─ Service enforces ownership

5. Backend: Service Layer Authorization
   ├─ Checks user owns business
   ├─ Returns 404 if not (prevents info leakage)
   └─ Proceeds with operation
```

## Key Architectural Decisions

### 1. Clean Separation of Concerns

- **Routes** only define HTTP endpoints
- **Controllers** only handle HTTP concerns
- **Services** contain all business logic
- **Utilities** provide reusable functions
- **Benefit**: Easy to test, maintain, extend

### 2. Centralized Error Handling

- All errors thrown as custom error classes
- Single error middleware processes all errors
- Consistent error response format
- **Benefit**: Predictable error handling, easy to add logging

### 3. Async Error Wrapping

- All route handlers wrapped with asyncHandler
- Uncaught promise rejections caught automatically
- **Benefit**: No "unhandled rejection" errors in production

### 4. Input Validation in Middleware

- Zod schemas validate all requests
- Validation failures return 400 immediately
- **Benefit**: Controllers receive validated data only

### 5. Ownership Enforcement

- Services check ownership before mutations
- Returns 404 (not 403) if unauthorized
- **Benefit**: Prevents info leakage, consistent experience

### 6. Type Safety Throughout

- TypeScript strict mode enabled
- Custom interfaces (AuthRequest, etc.)
- Shared types from @ultimate-sf/shared
- **Benefit**: Catch errors at compile time

## Scalability Considerations

### Current

- ✅ Clean architecture supports easy testing
- ✅ Service layer isolation enables mock/test implementations
- ✅ Middleware pattern scales to new cross-cutting concerns
- ✅ Error handling infrastructure ready

### For Future Growth

- Add request logging middleware
- Add request rate limiting middleware
- Add caching layer in services
- Add database connection pooling
- Add background job queues
- Add GraphQL resolver layer (alongside REST)
- Add API versioning middleware

All current architectural decisions support these future enhancements without major refactoring.

## Deployment Considerations

### Environment-Based Configuration

- Different configs for dev/staging/production
- Sensitive values from environment variables only
- **File**: `src/config/env.ts`

### Health Check Endpoint

- Useful for load balancers and monitoring
- **Endpoint**: `GET /health`
- **Returns**: Status, timestamp, environment

### Error Logging Ready

- Error middleware captures all errors
- Can plug in Sentry, Datadog, etc.
- **Location**: `src/middlewares/error.middleware.ts`

### Security Headers

- Helmet middleware enabled
- CORS configured
- **File**: `src/app.ts`

## References

- [Authentication Flow](./AUTH.md)
- [API Endpoints](./API.md)
- [Setup Guide](./QUICK_START.md)
- [Express Middleware Pattern](https://expressjs.com/en/guide/using-middleware.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

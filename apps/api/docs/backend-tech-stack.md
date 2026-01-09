# Backend Tech Stack & Libraries

## Runtime & Core Stack

### Node.js

Node.js serves as the runtime environment for the backend API. It provides a JavaScript execution environment with access to system resources, file I/O, and networking capabilities.

**Why Node.js:**

- **JavaScript ecosystem**: Leverages the npm registry (2+ million packages) for rapid development
- **Asynchronous I/O**: Non-blocking architecture handles concurrent requests efficiently without thread management
- **Developer productivity**: Same language (TypeScript/JavaScript) for frontend and backend reduces context switching
- **Mature ecosystem**: Well-established frameworks, tools, and deployment platforms

**Trade-offs:**

- **Single-threaded**: CPU-intensive operations can block the event loop (not an issue for I/O-heavy API workloads)
- **Memory usage**: Higher baseline memory than compiled languages, but acceptable for cloud deployments

**Fit for this project**: The Ultimate Street Food Finder API is I/O-bound (database queries, file uploads, HTTP requests). Node.js excels at this workload, handling hundreds of concurrent requests with minimal resource usage.

### Express

Express is a minimalist web framework for Node.js, providing routing, middleware support, and HTTP utilities.

**Why Express:**

- **Simplicity**: Minimal abstraction over Node.js HTTP module, easy to understand and debug
- **Middleware ecosystem**: Thousands of compatible middleware packages (authentication, validation, logging)
- **Flexibility**: No opinions on project structure or ORM, allowing custom architecture
- **Battle-tested**: Powers major production applications, extensive documentation and community support

**Trade-offs:**

- **Manual setup**: Requires assembling middleware stack manually (vs. batteries-included frameworks)
- **Boilerplate**: More code needed for error handling, validation compared to opinionated frameworks

**Fit for this project**: Express provides exactly what this API needs without unnecessary abstractions. The manual setup cost is minimal for a project of this size, and the flexibility allows for a clean service-oriented architecture.

### TypeScript

TypeScript adds static typing to JavaScript, catching errors at compile time and improving code documentation through type annotations.

**Why TypeScript:**

- **Type safety**: Prevents entire classes of runtime errors (null reference, type mismatches)
- **Developer experience**: IDE autocomplete, inline documentation, refactoring support
- **Gradual adoption**: Can add types incrementally, works with existing JavaScript libraries
- **Documentation**: Type signatures serve as inline documentation that can't drift out of sync

**Trade-offs:**

- **Build step**: Requires compilation to JavaScript before execution (handled by `tsx` in development)
- **Learning curve**: Developers need to understand generics, type inference, and advanced type features
- **Configuration**: Requires `tsconfig.json` tuning for strict mode, module resolution

**Fit for this project**: TypeScript catches bugs during development, makes refactoring safer, and provides excellent IDE support. The strict mode configuration ensures maximum type safety, critical for maintaining code quality as the team grows.

**Why this stack fits small-to-medium applications:**

The Node.js + Express + TypeScript combination is ideal for startups and small teams:

- **Fast iteration**: No compile-wait for development builds (using `tsx watch`)
- **Cloud-friendly**: Deploys easily to Vercel, Railway, Render, AWS Lambda
- **Scalable**: Handles 1-10,000 requests/second without architectural changes
- **Talent availability**: Large pool of JavaScript/TypeScript developers
- **Cost-effective**: Low resource usage, runs efficiently on small instances

For applications requiring extreme performance (10M+ requests/second) or heavy computation, languages like Go or Rust might be more appropriate. For this API's use case, the developer productivity benefits outweigh any marginal performance gains.

## Backend Platform

### Supabase

Supabase is an open-source Firebase alternative providing managed PostgreSQL, authentication, storage, and real-time subscriptions.

**Components used in this project:**

**PostgreSQL Database:**

- Fully managed PostgreSQL 15+ with automatic backups
- Direct SQL access for complex queries and migrations
- Built-in extensions (PostGIS for geolocation, pgvector for embeddings)
- Row Level Security (RLS) for fine-grained access control

**Storage:**

- S3-compatible object storage with global CDN
- Public and private buckets
- Automatic image optimization and transformation (when configured)
- Integrates with PostgreSQL for metadata storage

**Authentication (future integration):**

- OAuth providers (Facebook, Google, Apple)
- JWT token generation and validation
- User management UI
- Works with Firebase Authentication for flexibility

**Why Supabase:**

- **Developer experience**: Simple API, excellent documentation, generous free tier
- **PostgreSQL**: Robust relational database with 30+ years of development, ACID compliance
- **All-in-one**: Database, storage, and auth in one platform reduces operational complexity
- **Open source**: Can self-host if needed, no vendor lock-in concerns
- **Real-time**: Built-in WebSocket support for live updates (not currently used but available)

**Trade-offs:**

- **Less mature than AWS**: Smaller ecosystem, fewer advanced features than AWS RDS
- **Vendor coupling**: Switching to another provider requires data migration
- **Scaling limits**: Free tier limits (500MB database, 1GB storage); paid tiers required for production

**When scaling might require additional services:**

Supabase handles most small-to-medium application needs. Consider additional services when:

- **Database size exceeds limits**: Migrate to self-hosted PostgreSQL or AWS RDS
- **Complex queries**: Add read replicas or analytical databases (ClickHouse, BigQuery)
- **High-volume file storage**: Migrate images to dedicated CDN (Cloudinary, Imgix)
- **Advanced auth**: Add custom auth flows, multi-tenant isolation
- **Real-time at scale**: Use dedicated WebSocket service (Pusher, Ably)

**Current fit**: Supabase provides everything this API needs with minimal operational overhead. The managed PostgreSQL and Storage services eliminate devops work, allowing the team to focus on features.

## Important Libraries

### @supabase/supabase-js

Official Supabase client library for JavaScript/TypeScript.

**What it does:**

- Provides typed query builder for PostgreSQL operations (insert, select, update, delete)
- Handles authentication token management
- Wraps Storage API for file uploads/downloads
- Manages real-time subscriptions (WebSocket)

**Where it's used:**

- `src/lib/supabase.ts`: Creates two client instances (anon and admin/service role)
- `src/services/*.service.ts`: All database queries use the `supabaseAdmin` client
- Image upload/delete operations in `src/services/menu.service.ts`

**Why it was chosen:**

- **Official SDK**: Maintained by Supabase team, guaranteed compatibility
- **Type safety**: Automatically generates TypeScript types from database schema
- **Query builder**: Prevents SQL injection, provides clean API
- **Error handling**: Consistent error format across all operations

**Example usage:**

```typescript
const { data, error } = await supabaseAdmin
  .from("users")
  .select("*")
  .eq("id", userId)
  .single();
```

**Key configuration:**

- Service role client bypasses RLS for backend operations
- Anon client respects RLS for future client-side usage
- Both configured with `persistSession: false` for stateless API

### zod

TypeScript-first schema validation library.

**What it does:**

- Defines runtime validation schemas with type inference
- Validates request bodies, query parameters, and path parameters
- Provides detailed error messages for validation failures
- Generates TypeScript types from schemas

**Where it's used:**

- `src/validators/index.ts`: All validation schemas for API endpoints
- `src/middlewares/validate.middleware.ts`: Middleware that applies Zod schemas to requests
- Route definitions: Validation middleware applied before controllers

**Why it was chosen:**

- **Type inference**: Schemas automatically generate TypeScript types, eliminating duplication
- **Composability**: Schemas can be combined, extended, and reused
- **Error messages**: Detailed validation errors with field paths
- **Runtime safety**: Catches invalid data before it reaches business logic

**Example usage:**

```typescript
export const createBusinessSchema = z.object({
  name: z.string().min(1).max(255),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

// Inferred type
type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
```

**Benefits:**

- Single source of truth for validation and types
- Prevents invalid data from corrupting database
- Clear error responses for API consumers

### multer

Middleware for handling `multipart/form-data` (file uploads).

**What it does:**

- Parses multipart form data from HTTP requests
- Buffers uploaded files in memory or disk
- Provides file metadata (original name, size, MIME type)
- Integrates with Express middleware chain

**Where it's used:**

- `src/controllers/menu.controller.ts`: Configured for menu image uploads
- Route: `POST /api/v1/business/:businessId/menu`

**Why it was chosen:**

- **Standard solution**: De facto file upload middleware for Express
- **Flexible storage**: Supports memory, disk, or custom storage engines
- **Validation**: Built-in file filtering by type, size limits
- **Mature**: Battle-tested in production, extensive documentation

**Configuration in this project:**

```typescript
const upload = multer({
  storage: multer.memoryStorage(), // Buffer files in RAM
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 3, // Max 3 files
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new BadRequestError("Only images allowed"));
    }
    cb(null, true);
  },
});
```

**Memory storage rationale**: Files are immediately uploaded to Supabase Storage and not saved to disk. Memory storage avoids file system I/O and cleanup complexity.

### dotenv

Loads environment variables from `.env` files.

**What it does:**

- Reads `.env` file at application startup
- Populates `process.env` with key-value pairs
- Supports default values and variable expansion

**Where it's used:**

- `src/config/env.ts`: Called at the top of config module
- Loads all environment variables before validation

**Why it was chosen:**

- **Standard pattern**: Widely adopted in Node.js projects (12 Factor App methodology)
- **Development convenience**: Easy to configure local environment without setting system variables
- **Security**: `.env` files excluded from git, preventing credential leaks

**Usage:**

```typescript
import dotenv from "dotenv";
dotenv.config(); // Loads .env file

// Now process.env contains variables
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

**Best practices followed:**

- `.env.example` in repository shows required variables (without secrets)
- `.env` in `.gitignore` to prevent accidental commits
- Runtime validation ensures all required variables are set

### helmet

Security middleware for Express that sets various HTTP headers.

**What it does:**

- Sets Content Security Policy (CSP) headers
- Enables HTTP Strict Transport Security (HSTS)
- Prevents clickjacking with X-Frame-Options
- Disables X-Powered-By header
- Sets other security-related headers

**Where it's used:**

- `src/app.ts`: Applied globally to all routes

**Why it was chosen:**

- **Easy security wins**: One-line setup for multiple security headers
- **Best practices**: Implements OWASP recommendations
- **Minimal overhead**: Header setting has negligible performance impact

**Configuration:**

```typescript
app.use(helmet()); // Default secure configuration
```

**Headers set:**

- `Content-Security-Policy`: Prevents XSS attacks
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking
- `Strict-Transport-Security`: Forces HTTPS

### express-rate-limit

Rate limiting middleware to prevent abuse.

**What it does:**

- Tracks request counts per IP address or user
- Returns 429 status when limit exceeded
- Configurable time windows and limits

**Where it's used:**

- Currently installed but not actively configured
- Prepared for production deployment

**Why it was chosen:**

- **Simple setup**: Easy to configure and customize
- **Flexible**: Per-route or global limits
- **Memory or Redis**: Can use in-memory store or Redis for distributed systems

**Future configuration:**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests",
});

app.use("/api/", limiter);
```

**Production considerations:**

- Use Redis store for multi-instance deployments
- Different limits for different endpoints (stricter for auth, looser for reads)
- Whitelist for trusted clients

## Folder Structure Explanation

The backend follows a layered architecture with clear separation of concerns:

```
src/
├── routes/         HTTP routing and middleware composition
├── controllers/    HTTP request/response handling
├── services/       Business logic and data access
├── validators/     Input validation schemas
├── middlewares/    Reusable request processing
├── lib/            External service clients
├── utils/          Helper functions and utilities
├── config/         Application configuration
```

### routes/

**Responsibility**: Define API endpoints and compose middleware pipelines.

**Contains**:

- Route definitions using Express Router
- Middleware composition (validation → controller)
- HTTP method specifications (GET, POST, DELETE)

**Example**:

```typescript
router.post(
  "/:userId/business",
  validateParams(userIdParamSchema),
  validateBody(createBusinessSchema),
  businessController.createBusiness
);
```

**Rationale**: Routes only wire components together, containing no business logic. This makes endpoint structure easy to understand and modify.

### controllers/

**Responsibility**: Handle HTTP concerns (request parsing, response formatting).

**Contains**:

- Request parameter extraction
- Calling service layer functions
- Formatting responses using utility functions
- HTTP status code selection

**Example**:

```typescript
export const createBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.createBusiness(
    req.params.userId,
    req.body
  );
  sendCreated(res, business);
});
```

**Rationale**: Controllers are thin adapters between HTTP and business logic. They don't contain business rules, making them trivial to test and easy to change if HTTP framework changes.

### services/

**Responsibility**: Implement business logic, data validation, and database operations.

**Contains**:

- Database queries using Supabase client
- Business rule enforcement (ownership checks, limits)
- Data transformation and aggregation
- Error throwing for exceptional cases

**Example**:

```typescript
export const createBusiness = async (
  userId: string,
  data: CreateBusinessData
) => {
  // Verify user exists (business rule)
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!user) throw new NotFoundError("User not found");

  // Create business
  const { data: business } = await supabaseAdmin
    .from("business")
    .insert({ user_id: userId, ...data })
    .select()
    .single();

  return business;
};
```

**Rationale**: All business logic lives in services, making it easy to test without HTTP concerns. Services can be reused across controllers, background jobs, or CLI tools.

### validators/

**Responsibility**: Define and export Zod schemas for input validation.

**Contains**:

- Zod schema definitions
- Reusable schema fragments (UUID validation, pagination)
- Type exports inferred from schemas

**Example**:

```typescript
export const createBusinessSchema = z.object({
  name: z.string().min(1).max(255),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});
```

**Rationale**: Centralized validation schemas prevent duplication and ensure consistency. Validators are independent of routes/controllers, making them easy to test and reuse.

### middlewares/

**Responsibility**: Reusable request processing functions.

**Contains**:

- Validation middleware (applies Zod schemas)
- Error handling middleware (catches exceptions, formats errors)
- Async handler wrapper (eliminates try-catch boilerplate)

**Example**:

```typescript
export const validateBody = (schema: ZodSchema) => {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError("Validation failed", error.errors);
      }
      next(error);
    }
  };
};
```

**Rationale**: Middleware encapsulates cross-cutting concerns, keeping routes and controllers clean. Each middleware has a single responsibility and can be composed flexibly.

### lib/

**Responsibility**: Initialize and export external service clients.

**Contains**:

- Supabase client initialization
- Firebase Admin SDK setup
- Future: Redis, email service, payment gateway clients

**Example**:

```typescript
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);
```

**Rationale**: Client initialization is centralized, ensuring consistent configuration. Services import clients rather than creating them, making testing easier (can mock clients).

### utils/

**Responsibility**: Helper functions and reusable utilities.

**Contains**:

- HTTP error classes
- API response formatters
- Utility functions (data transformation, formatting)

**Example**:

```typescript
export const sendCreated = (res, data) => {
  return res.status(201).json({ data });
};
```

**Rationale**: Utilities eliminate duplication and enforce consistency (all success responses use same format).

### config/

**Responsibility**: Load and validate application configuration.

**Contains**:

- Environment variable loading (dotenv)
- Configuration validation
- Typed config exports

**Example**:

```typescript
export const config = {
  port: Number(process.env.PORT) || 4000,
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
};
```

**Rationale**: Configuration is loaded once at startup and validated. Modules import typed config rather than reading `process.env` directly, making environment requirements explicit.

### How this structure improves testability:

**Unit testing services**: Services have no HTTP dependencies, can be tested with mocked database clients:

```typescript
test("createBusiness throws when user not found", async () => {
  // Mock supabaseAdmin to return null user
  await expect(createBusiness("invalid-id", businessData)).rejects.toThrow(
    NotFoundError
  );
});
```

**Integration testing controllers**: Controllers can be tested with Supertest without starting a real server:

```typescript
import request from "supertest";
import app from "./app";

test("POST /api/v1/users/:userId/business", async () => {
  const response = await request(app)
    .post("/api/v1/users/123/business")
    .send({ name: "Test Business", ...coords });

  expect(response.status).toBe(201);
});
```

**Mocking boundaries**: Clear layer separation means mocks are simple (mock service in controller test, mock database in service test).

### How this structure improves scalability:

**Horizontal scaling**: Stateless architecture runs on multiple instances without code changes.

**Feature development**: New features add new routes/controllers/services without modifying existing code.

**Refactoring**: Business logic changes happen in services, leaving routes/controllers untouched. Reduces regression risk.

**Team growth**: Junior developers can work on controllers/routes while senior developers handle complex service logic.

### How this structure avoids tight coupling:

**Dependency direction**: Routes depend on controllers, controllers depend on services, services depend on database clients. Never the reverse.

**Interface-based**: Services expose functions, not implementation details. Can swap Supabase for another database without changing controllers.

**Single responsibility**: Each layer has one job. Validation middleware doesn't know about database. Services don't know about HTTP.

**Easy to change**: Swapping Express for Fastify only requires changing routes and controllers. Business logic remains untouched.

## Error Handling Strategy

The API uses a centralized error handling approach that provides consistent error responses across all endpoints.

### Centralized Error Middleware

All errors (thrown or rejected promises) flow through a single error handler implemented in `src/middlewares/error.middleware.ts`. This middleware:

- Catches all thrown errors and rejected promises (wrapped by `asyncHandler`)
- Formats errors consistently in a response object with `code`, `message`, and optional `details`
- Logs errors in development for debugging
- Hides internal error details in production

### Typed HTTP Errors

Custom error classes in `src/utils/http-errors.ts` provide type safety and semantic meaning:

- `NotFoundError` → 404 status
- `ValidationError` → 400 status with field-level details
- `UnauthorizedError` → 401 status
- Extensible for new error types as needed

**Benefits**:

- Self-documenting code (error type indicates HTTP semantics)
- No try-catch blocks needed in controllers (using `asyncHandler` wrapper)
- Single source of truth for error handling
- Easy to add error logging, monitoring, or alerting

### Consistent API Response Format

All API responses follow a predictable structure (see [API.md Error Codes](./API.md#error-codes) for complete reference):

**Success responses**: `{ "data": { ... }, "meta": { "pagination": { ... } } }`

**Error responses**: `{ "error": { "code": "ERROR_CODE", "message": "...", "details": [...] } }`

This consistency allows clients to reliably parse responses and implement error handling logic.

## Testing Readiness

The architecture is designed to support comprehensive testing without requiring a running server or database.

### Supertest Integration

The Express app is exported separately from the server, allowing Supertest to run tests without binding to a port:

```typescript
// src/app.ts
const app = express();
// ... middleware setup
export default app;

// src/server.ts
import app from "./app";
app.listen(config.port);
```

**Test example**:

```typescript
import request from "supertest";
import app from "../src/app";

describe("User API", () => {
  it("creates user via Facebook login", async () => {
    const response = await request(app).post("/api/v1/users/facebook").send({
      name: "Test User",
      provider: "facebook",
      provider_user_id: "fb_123",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.name).toBe("Test User");
  });
});
```

### Service Unit Testing

Services have no HTTP dependencies and accept simple parameters:

```typescript
import { createBusiness } from "../src/services/business.service";
import { supabaseAdmin } from "../src/lib/supabase";

jest.mock("../src/lib/supabase");

describe("Business Service", () => {
  it("throws NotFoundError when user does not exist", async () => {
    (supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
    });

    await expect(createBusiness("invalid-id", businessData)).rejects.toThrow(
      NotFoundError
    );
  });
});
```

**Why services are easy to test**:

- Pure functions: Input → Database operations → Output
- No HTTP concerns (req/res objects)
- Database can be mocked at client level
- Business logic isolated and testable

### Controller Thinness

Controllers contain minimal logic, making them less critical to test:

```typescript
export const createBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.createBusiness(
    req.params.userId,
    req.body
  );
  sendCreated(res, business);
});
```

**What to test**:

- Services: Business logic, validation, database operations
- Integration tests: Full request → response flow with real database
- Controllers: Usually covered by integration tests, rarely need unit tests

**Testing pyramid**:

- Many unit tests for services (fast, focused)
- Moderate integration tests (realistic scenarios)
- Few end-to-end tests (expensive, brittle)

## Future Enhancements

The architecture is ready for common feature additions without major refactoring.

### Authentication Middleware

Add JWT verification middleware:

```typescript
// src/middlewares/auth.middleware.ts
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decodedToken = await verifyFirebaseToken(token);
  req.user = { id: decodedToken.uid };
  next();
});
```

**Usage**:

```typescript
router.post(
  "/:userId/business",
  requireAuth, // Add authentication
  validateParams(userIdParamSchema),
  validateBody(createBusinessSchema),
  businessController.createBusiness
);
```

**Impact**: Routes file changes only. Controllers and services remain unchanged.

### Role-Based Access Control

Add role checking middleware:

```typescript
export const requireRole = (role: string) => {
  return asyncHandler(async (req, res, next) => {
    if (req.user.role !== role) {
      throw new ForbiddenError("Insufficient permissions");
    }
    next();
  });
};
```

**Usage**:

```typescript
router.delete(
  "/users/:id",
  requireAuth,
  requireRole("admin"), // Admin-only endpoint
  validateParams(uuidParamSchema),
  usersController.deleteUser
);
```

### Pagination & Caching

**Pagination** is already implemented:

```typescript
// In users.service.ts
export const getAllUsers = async (limit = 50, offset = 0) => {
  const { data, count } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1);

  return { users: data, total: count };
};
```

**Adding caching** (Redis example):

```typescript
import Redis from 'ioredis';
const redis = new Redis();

export const getAllUsers = async (limit = 50, offset = 0) => {
  const cacheKey = `users:${limit}:${offset}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const result = await supabaseAdmin...;

  // Cache for 60 seconds
  await redis.setex(cacheKey, 60, JSON.stringify(result));

  return result;
};
```

**Impact**: Changes isolated to service layer. Routes and controllers unaffected.

### Observability & Logging

Add structured logging:

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Use in services
logger.info("Business created", { businessId, userId });
logger.error("Database error", { error, query });
```

**Integrate with error middleware**:

```typescript
export const errorHandler = (err, req, res, _next) => {
  logger.error("Request failed", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  // ... error response
};
```

**Future additions**:

- APM tools (New Relic, DataDog)
- Error tracking (Sentry)
- Request tracing (OpenTelemetry)
- Performance monitoring

All of these integrate at middleware or service level without disrupting business logic.

# Security & Best Practices

## Overview

This document outlines security measures implemented in the API and best practices for maintaining security as the application grows.

## Authentication Security

### JWT Verification

```typescript
// Every protected route verifies Supabase JWT
const {
  data: { user },
  error,
} = await supabaseAdmin.auth.getUser(token);

if (error || !user) {
  throw new UnauthorizedError("Invalid or expired token");
}
```

**Security Properties**:

- ✅ JWTs signed with `SUPABASE_JWT_SECRET`
- ✅ Tokens expire automatically (default 1 hour)
- ✅ Signature verified on every request
- ✅ Cannot modify JWT without invalidating signature
- ✅ User ID extracted from verified token

### Token Storage (Frontend)

- Store JWTs in secure storage (AsyncStorage on React Native)
- Never store in plain text or localStorage
- Refresh tokens automatically before expiration
- Clear on logout

## Authorization Security

### Ownership Verification

```typescript
// Services enforce ownership before any mutation
export const updateBusiness = async (
  businessId: string,
  userId: string, // From verified JWT
  updates: UpdateBusinessData
) => {
  // Check ownership - throws 404 if doesn't match
  const business = await getBusinessById(businessId, userId);

  // Additional safety: where clause also checks user_id
  return supabaseAdmin
    .from("business")
    .update(updates)
    .eq("id", businessId)
    .eq("user_id", userId) // Cannot be bypassed
    .select()
    .single();
};
```

**Security Pattern**:

1. Verify user owns resource (service layer)
2. Include ownership check in database query (defense in depth)
3. Return 404 (not 403) to prevent info leakage

### 404 vs 403

```typescript
// ❌ BAD - Leaks information
if (!user.owns(business)) {
  throw new ForbiddenError("You don't own this business");
  // Attacker knows the business exists
}

// ✅ GOOD - Prevents information leakage
// Always return 404 if:
// - Resource doesn't exist, OR
// - User doesn't own it
throw new NotFoundError("Business not found");
```

## Input Validation

### Zod Validation

```typescript
// All request bodies validated with Zod schemas
const createBusinessSchema = z.object({
  name: z.string().min(1, "Name required").max(255, "Name too long"),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  // ... more fields
});

// Validation happens in middleware before controller
router.post(
  "/",
  validateBody(createBusinessSchema), // Validates here
  businessController.createBusiness // Safe data guaranteed
);
```

**Benefits**:

- ✅ Prevents injection attacks
- ✅ Type-safe data in controllers
- ✅ Clear error messages
- ✅ Consistent validation across API

### Validation Rules

```typescript
// Business name validation
name: z.string()
  .min(1, "Required") // Cannot be empty
  .max(255, "Too long"); // Prevent DoS via massive input

// Coordinate validation
longitude: z.number().min(-180).max(180); // Enforce geographic validity

latitude: z.number().min(-90).max(90);

// Description validation
description: z.string()
  .max(1000) // Prevent excessive storage
  .optional()
  .nullable();
```

## Data Protection

### Secure Default Values

```typescript
// Empty arrays for optional fields
images: TEXT[] DEFAULT '{}'

// Timestamps with timezone info
created_at TIMESTAMPTZ DEFAULT NOW()

// No sensitive data in defaults
```

### Password Security

- Handled entirely by Supabase Auth
- Passwords never sent to/stored by backend
- OAuth only (Facebook) - no password management

### Sensitive Data

- Never log JWTs or user tokens
- Never return sensitive data in error messages
- Don't expose database structure in errors
- Generic error messages for auth failures

## Error Handling Security

### Generic Error Messages

```typescript
// ❌ BAD - Exposes database details
catch (error) {
  if (error.code === 'FOREIGN_KEY_VIOLATION') {
    throw new BadRequestError("User doesn't exist");
  }
}

// ✅ GOOD - Generic message
if (!profile) {
  throw new NotFoundError("Resource not found");
}
```

### Error Logging

```typescript
// Log detailed errors internally
logger.error("Database error", {
  error: err,
  userId: req.userId,
  operation: "updateBusiness",
  businessId: businessId,
});

// Send generic message to client
res.status(500).json({
  error: {
    code: "INTERNAL_ERROR",
    message: "An error occurred", // No details
  },
});
```

## Network Security

### CORS Configuration

```typescript
// Restrict to known origins
const corsOptions = {
  origin: ["https://yourapp.com", "https://app.yourapp.com"],
  credentials: true,
};

app.use(cors(corsOptions));
```

**Current Development Setting**:

- `CORS_ORIGIN=*` for development only
- Must be restricted in production

### HTTPS/TLS

- ✅ Always use HTTPS in production
- ✅ No unencrypted HTTP
- ✅ Enforce HSTS headers
- ✅ Valid SSL certificate

### Security Headers

```typescript
// Helmet adds security headers
app.use(helmet());

// Results in headers like:
// Strict-Transport-Security: max-age=15552000; includeSubDomains
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
```

## Rate Limiting

### Current Status

- `express-rate-limit` installed but not active
- Ready for production deployment

### Rate Limiting Configuration

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all API routes
app.use("/api/", limiter);

// Stricter limits for auth-related endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per window
});
app.post("/api/auth/*", authLimiter);
```

## Environment Variables

### Required for Security

```bash
# Supabase (required, sensitive)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Never expose!
SUPABASE_JWT_SECRET=...         # Never expose!

# Server (required)
PORT=4000
NODE_ENV=production

# CORS (required, restrict in production)
CORS_ORIGIN=https://yourapp.com

# These should NOT be in version control
# Use .env file (in .gitignore) or secrets manager
```

### Never Commit

- `.env` files
- Service keys or tokens
- Private keys
- Database credentials

## Database Security

### Foreign Key Constraints

```sql
-- Prevents orphaned records
CREATE TABLE business (
  user_id UUID NOT NULL REFERENCES profiles(id)
);

-- Automatic cleanup
ALTER TABLE business
  ADD CONSTRAINT business_user_id_fk
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;
```

### Constraints Prevent

- ❌ Assigning business to non-existent user
- ❌ Creating menu for non-existent business
- ❌ Orphaned records when user deleted

### Future: Row Level Security

```sql
-- Enforce at database level (not app level)
CREATE POLICY "Users see only own businesses"
  ON business FOR SELECT
  USING (auth.uid() = user_id);

-- Currently enforced in application layer
-- RLS provides additional security layer
```

## Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
npm install <package>@latest

# Remove unused dependencies
npm prune
```

### Vulnerable Packages to Avoid

- Eval-based libraries
- Outdated authentication libraries
- Packages with known CVEs

## Deployment Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set strong `CORS_ORIGIN` (not `*`)
- [ ] Enable rate limiting
- [ ] Use HTTPS/TLS
- [ ] Set secure cookie flags
- [ ] Enable logging and monitoring
- [ ] Configure Supabase backups
- [ ] Set database backups
- [ ] Review Supabase RLS policies
- [ ] Enable audit logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor for suspicious activity
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Document incident response plan

## Common Vulnerabilities & Mitigations

### SQL Injection

**Mitigation**: Using Supabase client library (parameterized queries)

```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM business WHERE id = '${id}'`;

// ✅ SAFE (what we use)
supabaseAdmin.from("business").select("*").eq("id", id);
```

### Cross-Site Scripting (XSS)

**Mitigation**: JSON API (not HTML), input validation

```typescript
// API returns JSON, not HTML
res.json({ data: business }); // ✅ Safe

// XSS impossible in JSON API
// Frontend frameworks sanitize when rendering
```

### Cross-Site Request Forgery (CSRF)

**Mitigation**: JWT authentication

```typescript
// JWTs from Supabase Auth cannot be forged
// No cookies = no CSRF
```

### Broken Access Control

**Mitigation**: Ownership verification + 404

```typescript
// Always check ownership
await getBusinessById(businessId, userId);

// Return 404 if doesn't exist or not owned
// No information leakage
```

## Monitoring & Logging

### What to Log

- Authentication attempts (success/failure)
- Authorization failures (ownership violations)
- Unusual data patterns
- Rate limit violations
- Errors with context (not sensitive data)

### What NOT to Log

- Passwords or tokens
- Full request/response bodies
- User PII (except user_id)
- JWT contents

### Example Logging

```typescript
logger.info("Business created", {
  businessId: business.id,
  userId: req.userId,
  businessName: business.name,
  timestamp: new Date().toISOString(),
});

logger.warn("Unauthorized access attempt", {
  userId: req.userId,
  attemptedResource: businessId,
  operation: "update",
});
```

## Incident Response

### Security Incident Steps

1. Stop active attack (disable compromised account)
2. Investigate scope (what data accessed?)
3. Contain damage (limit access, reset credentials)
4. Notify affected users
5. Fix vulnerability
6. Document lessons learned

### Contact

- Report vulnerabilities responsibly
- Don't disclose publicly until fixed
- Give reasonable time to patch

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

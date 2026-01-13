# Authentication Architecture

## Overview

The Ultimate Street Food Finder backend uses **Supabase Auth exclusively** for user authentication. Firebase Auth has been completely removed.

## Authentication Flow

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │         │  Supabase Auth   │         │   Backend   │
│ (React Native)        │   (OAuth Provider)│         │  (Express)  │
└──────┬──────┘         └────────┬─────────┘         └──────┬──────┘
       │                         │                           │
       │  1. Login with Facebook │                           │
       ├────────────────────────>│                           │
       │                         │                           │
       │  2. OAuth flow          │                           │
       │     (handled by Supabase)                           │
       │                         │                           │
       │  3. JWT token           │                           │
       │<────────────────────────┤                           │
       │                         │                           │
       │  4. API request with JWT                            │
       ├────────────────────────────────────────────────────>│
       │     Authorization: Bearer <token>                   │
       │                         │                           │
       │                         │  5. Verify JWT            │
       │                         │<──────────────────────────┤
       │                         │                           │
       │                         │  6. Return user data      │
       │                         ├──────────────────────────>│
       │                         │                           │
       │                         │  7. Ensure profile exists │
       │                         │     (idempotent)          │
       │                         │                           │
       │  8. API response        │                           │
       │<────────────────────────────────────────────────────┤
       │                         │                           │
```

## Step-by-Step Process

### 1. Frontend: Facebook Login via Supabase

```typescript
// In mobile app (React Native)
import { supabase } from "./lib/supabase";

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "facebook",
});
```

Supabase Auth SDK handles the entire OAuth flow:

- Redirects to Facebook login
- Handles OAuth callbacks
- Creates `auth.users` record
- Returns JWT to frontend

### 2. Frontend: Store and Use JWT

```typescript
// Get session
const {
  data: { session },
} = await supabase.auth.getSession();
const jwt = session?.access_token;

// Use in API calls
fetch("http://localhost:4000/api/v1/business", {
  headers: {
    Authorization: `Bearer ${jwt}`,
  },
});
```

### 3. Backend: Verify JWT Middleware

```typescript
// In auth.middleware.ts
export const requireAuth = async (req, res, next) => {
  // Extract token from header
  const token = req.headers.authorization?.replace("Bearer ", "");

  // Verify with Supabase
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  // Ensure profile exists (idempotent)
  await ensureProfileExists(user.id, user.user_metadata?.name || "User");

  // Attach user ID to request
  req.userId = user.id;
  next();
};
```

### 4. Backend: Profile Management

The backend automatically creates profiles for authenticated users:

```typescript
async function ensureProfileExists(userId: string, name: string) {
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    // Profile doesn't exist, create it
    await supabaseAdmin.from("profiles").insert({
      id: userId, // Same as auth.users.id
      name: name,
    });
  }
}
```

**This is idempotent** - safe to call on every request. The profile is created once and reused.

### 5. Backend: Use User ID in Business Logic

```typescript
// In business.controller.ts
export const createBusiness = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // req.userId is automatically set by auth middleware
    const business = await businessService.createBusiness(req.userId, req.body);
    sendCreated(res, business);
  }
);
```

## Database Schema

```sql
-- Supabase Auth (managed externally)
auth.users
  ├── id (uuid)
  ├── email
  ├── created_at
  └── user_metadata (JSONB)

-- Our application tables
public.profiles
  ├── id (uuid) → references auth.users(id) ON DELETE CASCADE
  ├── name (varchar)
  ├── created_at
  └── updated_at

public.business
  ├── id (uuid)
  ├── user_id (uuid) → references profiles(id)
  ├── name, description, image
  ├── longitude, latitude
  ├── created_at
  └── updated_at

public.menu
  ├── id (uuid)
  ├── business_id (uuid) → references business(id)
  ├── menu (text)
  ├── images (text[])
  ├── created_at
  └── updated_at
```

## Key Points

### ✅ Backend Does

- Verify Supabase JWTs
- Create/ensure profiles exist
- Enforce business/menu ownership
- All CRUD operations on business and menu

### ❌ Backend Does NOT

- Implement Facebook OAuth flow
- Store Facebook credentials
- Handle Facebook API calls
- Use Firebase Admin SDK (completely removed)
- Manage user passwords

## Environment Variables

```bash
# Required for Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Firebase variables REMOVED
# FIREBASE_PROJECT_ID (removed)
# FIREBASE_CLIENT_EMAIL (removed)
# FIREBASE_PRIVATE_KEY (removed)
```

## Protected Routes

All routes under `/api/v1/business` and `/api/v1/business/:businessId/menu` require authentication:

```typescript
// In business.routes.ts and menu.routes.ts
router.use(requireAuth); // All routes require auth
```

## Error Handling

```json
// 401 Unauthorized - Invalid token
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}

// 404 Not Found - Business doesn't exist or not owned
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Business not found"
  }
}
```

## Security Features

1. **JWT Verification**: All protected routes verify Supabase JWTs
2. **Ownership Enforcement**: Business/menu operations check `user_id`
3. **404 Instead of 403**: Prevents leaking resource existence
4. **UUID Primary Keys**: Non-sequential, can't be enumerated
5. **No OAuth Secrets**: Backend never touches Facebook credentials
6. **Profile Cascade**: Deleting auth.users cascades to profiles, business, menu

## Testing Authentication

```bash
# 1. Get JWT from Supabase Auth (via frontend)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Test authenticated endpoint
curl -X POST http://localhost:4000/api/v1/business \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business",
    "longitude": -122.4194,
    "latitude": 37.7749
  }'

# 3. Test without auth (should fail)
curl -X POST http://localhost:4000/api/v1/business \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Response: 401 Unauthorized
```

## Migration from Firebase

**Historical Reference Only** - This section is kept for reference if you're maintaining code that previously used Firebase. The backend has been completely migrated to Supabase Auth.

**Removed:**

- `src/lib/firebase.ts` - Firebase Admin SDK initialization
- `src/services/users.service.ts` - Custom user management
- `src/services/user-identities.service.ts` - OAuth identity tracking
- `src/controllers/users.controller.ts` - User CRUD endpoints
- `src/controllers/user-identities.controller.ts` - Identity endpoints
- `firebase-admin` npm package

**Replaced with:**

- `src/middlewares/auth.middleware.ts` - Supabase JWT verification
- Supabase Auth SDK for all authentication
- `profiles` table instead of `users` table
- Removed `user_identities` table (Supabase manages this)

## Troubleshooting

**"Invalid or expired token"**

- Check that token is valid Supabase JWT
- Verify `SUPABASE_JWT_SECRET` matches your project
- Ensure token hasn't expired (default 1 hour)

**Profile not created**

- Check `auth.middleware.ts` logs
- Verify database permissions
- Ensure `profiles` table exists with correct schema

**Business operations fail with 404**

- Verify business belongs to authenticated user
- Check `user_id` matches `req.userId`
- Review ownership checks in service layer

## Related Documentation

- [Backend Architecture](./ARCHITECTURE.md) - System design and layer responsibilities
- [Database Schema](./DATABASE.md) - Detailed data models and relationships
- [Security Practices](./SECURITY.md) - Security measures and best practices
- [API Endpoints](./API.md) - RESTful endpoint reference
- [Setup Guide](./QUICK_START.md) - Installation and configuration

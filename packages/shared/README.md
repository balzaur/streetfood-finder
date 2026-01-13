# Shared Types Reference

This package contains all TypeScript type definitions shared across the entire application (API, Mobile App, etc.).

## Overview

All types are centralized here to ensure consistency and prevent duplication across the monorepo.

## Database Schema Types

### Profile

Represents a user profile linked to Supabase Auth. This extends `auth.users` with application-specific data.

```typescript
interface Profile {
  id: string; // References auth.users(id)
  name: string;
  created_at: string;
  updated_at: string;
}
```

**Note:** The `users` table has been removed. Profiles now directly reference Supabase Auth's `auth.users`.

### Business

Represents a street food vendor business.

```typescript
interface Business {
  id: string;
  user_id: string; // References profiles(id)
  name: string;
  description?: string | null;
  image?: string | null;
  longitude: number; // -180 to 180
  latitude: number; // -90 to 90
  created_at: string;
  updated_at: string;
}
```

### Menu

Represents a menu for a business.

```typescript
interface Menu {
  id: string;
  business_id: string; // References business(id)
  menu: string; // Menu text/description
  images: string[]; // Array of image URLs (max 3)
  created_at: string;
  updated_at: string;
}
```

## Request/Response Types

### Profile Operations

```typescript
// Create profile (typically handled automatically by backend)
interface CreateProfileData {
  id: string; // auth.users.id from Supabase
  name: string;
}

// Update profile
interface UpdateProfileData {
  name?: string;
}
```

### Business Operations

```typescript
// Create business
interface CreateBusinessData {
  name: string;
  description?: string | null;
  image?: string | null;
  longitude: number;
  latitude: number;
}

// Update business
interface UpdateBusinessData {
  name?: string;
  description?: string | null;
  image?: string | null;
  longitude?: number;
  latitude?: number;
}
```

### Menu Operations

```typescript
// Create menu
interface CreateMenuData {
  menu: string;
  images: string[]; // 1-3 image URLs
}

// Update menu
interface UpdateMenuData {
  menu?: string;
  images?: string[];
}
```

## Authentication Types

### AuthSession

Supabase authentication session data.

```typescript
interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
}
```

**Note:** Facebook login is handled entirely by Supabase Auth. The backend only verifies JWTs.

## API Response Types

### Success Response

```typescript
interface ApiSuccessResponse<T = any> {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}
```

### Error Response

```typescript
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Health Check

```typescript
interface HealthCheck {
  status: string;
  timestamp: string;
  environment?: string;
  supabase?: {
    connected: boolean;
  };
}
```

### Pagination

```typescript
interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface PaginationMeta {
  limit: number;
  offset: number;
  total?: number;
}
```

## Vendor Types (Mock Data)

```typescript
interface Vendor {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  rating: number;
  isOpen: boolean;
  priceRange: string;
  description: string;
  photoUrl: string;
}
```

## Migration Notes

### Removed Types

The following types have been removed as they're no longer part of the architecture:

- ❌ `User` - Replaced by `Profile`
- ❌ `UserIdentity` - OAuth identities managed by Supabase Auth
- ❌ `FacebookLoginData` - Facebook login handled by Supabase Auth
- ❌ `FacebookLoginResult` - No longer needed
- ❌ `CreateUserIdentityData` - No longer needed

### Field Naming Conventions

- `id` - UUID primary keys
- `*_id` - Foreign key references (e.g., `user_id`, `business_id`)
- `created_at`, `updated_at` - Timestamps in ISO 8601 format
- Optional fields use `?` or `| null` for database compatibility

## Usage Examples

### Frontend (Mobile App)

```typescript
import { Business, CreateBusinessData, AuthSession } from "@ultimate-sf/shared";

// Get auth session
const session: AuthSession = await supabase.auth.getSession();

// Create business
const businessData: CreateBusinessData = {
  name: "Taco Stand",
  longitude: -122.4194,
  latitude: 37.7749,
};

const response = await fetch("/api/v1/business", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(businessData),
});

const result: ApiSuccessResponse<Business> = await response.json();
```

### Backend (API)

```typescript
import { Business, CreateBusinessData } from "@ultimate-sf/shared";

export const createBusiness = async (
  profileId: string,
  data: CreateBusinessData
): Promise<Business> => {
  const { data: business } = await supabaseAdmin
    .from("business")
    .insert({
      user_id: profileId,
      ...data,
    })
    .select()
    .single();

  return business as Business;
};
```

## Type Safety Best Practices

1. **Always import from `@ultimate-sf/shared`** - Never duplicate types
2. **Use strict TypeScript** - Enable `strict: true` in tsconfig.json
3. **Avoid `any`** - Use specific types or generics
4. **Document complex types** - Add JSDoc comments for clarity
5. **Version types carefully** - Breaking changes affect all apps

## Building the Package

```bash
cd packages/shared
pnpm build
```

This compiles TypeScript to JavaScript and generates `.d.ts` declaration files.

## Adding New Types

1. Create or update files in `src/types/`
2. Export from `src/index.ts`
3. Run `pnpm build` in `packages/shared`
4. Types are automatically available in all consuming packages

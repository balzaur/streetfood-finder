# Ultimate Street Food Finder - API Quick Start Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account (https://supabase.com)

## Step 1: Database Setup

### Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be initialized

### Run SQL Migrations

In your Supabase SQL Editor, run the following SQL to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business table
CREATE TABLE IF NOT EXISTS business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  image TEXT,
  longitude DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu table
CREATE TABLE IF NOT EXISTS menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  menu TEXT NOT NULL,
  images TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User identities table
CREATE TABLE IF NOT EXISTS user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_user_id ON business(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_business_id ON menu(business_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_provider ON user_identities(provider, provider_user_id);
```

### Create Storage Bucket

1. In Supabase, go to **Storage**
2. Click **New Bucket**
3. Name: `menu-images`
4. Public bucket: **Yes**
5. Click **Create bucket**

### Configure Storage Policies (Optional)

For public read access, add this policy to the `menu-images` bucket:

```sql
-- Allow public read access to menu images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-images' );

-- Allow authenticated uploads (server-side with service role)
CREATE POLICY "Service Role Upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'menu-images' );
```

## Step 2: Get Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (starts with eyJ)
   - **service_role** key: `eyJhbGc...` (different from anon, keep this secret!)

## Step 3: Environment Setup

Navigate to the API directory:

```bash
cd apps/api
```

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and update with your Supabase credentials:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase Storage
SUPABASE_STORAGE_BUCKET_MENU_IMAGES=menu-images

# Firebase Authentication (Optional - leave empty for now)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Step 4: Install Dependencies

From the monorepo root:

```bash
pnpm install
```

## Step 5: Build Shared Package

The API depends on the shared package, so build it first:

```bash
cd packages/shared
pnpm build
cd ../../apps/api
```

## Step 6: Start Development Server

```bash
pnpm dev
```

You should see:

```
🍜 Ultimate Street Food Finder API
🚀 Server running on http://localhost:4000
📍 Environment: development
```

## Step 7: Test the API

### Test Health Endpoint

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "ok": true,
  "service": "api",
  "time": "2026-01-09T19:00:00.000Z"
}
```

### Create a User via Facebook Login

```bash
curl -X POST http://localhost:4000/api/v1/users/facebook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "provider": "facebook",
    "provider_user_id": "fb_123456",
    "provider_email": "juan@email.com"
  }'
```

### Create a Business

First, get the `user_id` from the previous response, then:

```bash
curl -X POST http://localhost:4000/api/v1/users/{USER_ID}/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tito'\''s Taco Stand",
    "description": "Best tacos in Manila!",
    "longitude": 121.0244,
    "latitude": 14.5547
  }'
```

### Create a Menu with Images

Prepare some test images (e.g., `test1.jpg`, `test2.jpg`), then:

```bash
curl -X POST http://localhost:4000/api/v1/business/{BUSINESS_ID}/menu \
  -F "menu=Beef Taco - $5, Chicken Taco - $4" \
  -F "images=@test1.jpg" \
  -F "images=@test2.jpg"
```

### Get All Users

```bash
curl http://localhost:4000/api/v1/users
```

## Common Issues

### Issue: "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY"

**Solution:** Make sure you've created a `.env` file and added your Supabase service role key.

### Issue: TypeScript errors about @ultimate-sf/shared

**Solution:** Build the shared package first:

```bash
cd packages/shared && pnpm build
```

### Issue: "Failed to upload image"

**Solution:**

1. Check that the `menu-images` bucket exists in Supabase Storage
2. Make sure the bucket is set to **public**
3. Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct

### Issue: Server starts but endpoints return 500 errors

**Solution:** Check your Supabase credentials are correct and the database tables are created.

## Next Steps

1. **Read the full documentation**: [docs/API.md](./docs/API.md)
2. **Configure Firebase** (optional): For user identity verification
3. **Add rate limiting**: Uncomment rate limiting code in production
4. **Set up monitoring**: Add logging and error tracking
5. **Write tests**: Add unit and integration tests
6. **Deploy to production**: See deployment section in README.md

## Available Scripts

```bash
pnpm dev         # Start development server with hot reload
pnpm build       # Build for production
pnpm start       # Run production build
pnpm typecheck   # Check TypeScript types
pnpm clean       # Remove build artifacts
```

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Use specific CORS origins (not `*`)
3. Enable rate limiting
4. Set up proper logging
5. Add monitoring (Sentry, etc.)
6. Use HTTPS
7. Configure Supabase RLS policies
8. Review security headers

## Getting Help

- **API Documentation**: [docs/API.md](./docs/API.md)
- **Architecture**: [README.md](./README.md#architecture)
- **Supabase Docs**: https://supabase.com/docs

## API Endpoint Summary

| Method | Endpoint                                     | Description                    |
| ------ | -------------------------------------------- | ------------------------------ |
| GET    | `/health`                                    | Health check                   |
| POST   | `/api/v1/users/facebook`                     | Create/login user via Facebook |
| GET    | `/api/v1/users`                              | List all users (paginated)     |
| GET    | `/api/v1/users/:id`                          | Get user by ID                 |
| POST   | `/api/v1/users/:id`                          | Update user                    |
| DELETE | `/api/v1/users/:id`                          | Delete user                    |
| POST   | `/api/v1/users/:userId/business`             | Create business                |
| GET    | `/api/v1/users/:userId/business`             | Get user's businesses          |
| POST   | `/api/v1/users/:userId/business/:businessId` | Update business                |
| DELETE | `/api/v1/users/:userId/business/:businessId` | Delete business                |
| POST   | `/api/v1/business/:businessId/menu`          | Create menu with images        |
| GET    | `/api/v1/business/:businessId/menu`          | Get business menus             |
| POST   | `/api/v1/business/:businessId/menu/:menuId`  | Update menu                    |
| DELETE | `/api/v1/business/:businessId/menu/:menuId`  | Delete menu                    |
| POST   | `/api/v1/user-identities`                    | Create user identity           |
| DELETE | `/api/v1/user-identities/:id`                | Delete user identity           |

For detailed request/response examples, see [docs/API.md](./docs/API.md).

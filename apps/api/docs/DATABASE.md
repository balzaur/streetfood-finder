# Data Models & Database Schema

## Overview

The Ultimate Street Food Finder API uses Supabase (PostgreSQL) with a simple, normalized schema. The database integrates directly with Supabase Auth for user authentication.

## Entity Relationship Diagram

```
┌──────────────────┐
│   auth.users     │  (Managed by Supabase Auth)
│                  │
│  ├── id (UUID)   │
│  ├── email       │
│  └── metadata    │
└────────┬─────────┘
         │
         │ (1:1 relationship)
         │ Foreign Key: id
         │
┌────────▼──────────────┐
│     profiles          │  (Our application)
│                       │
│  ├── id (UUID, PK)    │  ◄─ References auth.users(id)
│  ├── name (VARCHAR)   │
│  ├── created_at       │
│  └── updated_at       │
└────────┬──────────────┘
         │
         │ (1:M relationship)
         │ Foreign Key: user_id
         │
┌────────▼──────────────┐
│     business          │
│                       │
│  ├── id (UUID, PK)    │
│  ├── user_id (UUID)   │  ◄─ References profiles(id)
│  ├── name (VARCHAR)   │
│  ├── description      │
│  ├── image (URL)      │
│  ├── longitude        │
│  ├── latitude         │
│  ├── created_at       │
│  └── updated_at       │
└────────┬──────────────┘
         │
         │ (1:M relationship)
         │ Foreign Key: business_id
         │
┌────────▼──────────────┐
│       menu            │
│                       │
│  ├── id (UUID, PK)    │
│  ├── business_id      │  ◄─ References business(id)
│  ├── menu (TEXT)      │
│  ├── images (TEXT[])  │
│  ├── created_at       │
│  └── updated_at       │
└───────────────────────┘
```

## Table Definitions

### 1. Profiles

Links application users to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
```

**Purpose**: Store application-specific user data. Linked to `auth.users` managed by Supabase Auth.

**Key Points**:

- `id` is the same as `auth.users.id`
- `ON DELETE CASCADE` ensures cleanup when user is deleted from auth
- `name` comes from user metadata during Facebook OAuth
- Created automatically by backend when user first authenticates

**Constraints**:

- `id` must exist in `auth.users`
- `name` cannot be null or empty

### 2. Business

Street food vendor business information with geolocation.

```sql
CREATE TABLE business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  longitude DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_user_id ON business(user_id);
CREATE INDEX idx_business_location ON business(longitude, latitude);
CREATE INDEX idx_business_created_at ON business(created_at DESC);
```

**Purpose**: Store information about individual street food businesses/vendors.

**Fields**:

- `id`: Unique identifier (UUID)
- `user_id`: Owner of the business (references profiles)
- `name`: Business name (1-255 characters)
- `description`: Business description (optional, max 1000 characters)
- `image`: Storefront image URL (optional)
- `longitude`: Geographic longitude (-180 to 180)
- `latitude`: Geographic latitude (-90 to 90)
- `created_at`: Timestamp of creation
- `updated_at`: Last update timestamp

**Constraints**:

- `user_id` must reference existing profile
- `name` cannot be null
- `longitude` and `latitude` must be valid coordinates
- Deletion cascades from profiles (if user deleted, all businesses deleted)

**Indexes**:

- `idx_business_user_id`: Fast queries by owner
- `idx_business_location`: Geographic proximity queries (future use)
- `idx_business_created_at`: Sorting by recency

### 3. Menu

Menu items for a business with image uploads.

```sql
CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  menu TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_menu_business_id ON menu(business_id);
CREATE INDEX idx_menu_created_at ON menu(created_at DESC);
```

**Purpose**: Store menu items and associated images for a business.

**Fields**:

- `id`: Unique identifier (UUID)
- `business_id`: Owner business (references business)
- `menu`: Menu description/items (text, max length handled by app)
- `images`: Array of image URLs (TEXT[] array type)
- `created_at`: Timestamp of creation
- `updated_at`: Last update timestamp

**Constraints**:

- `business_id` must reference existing business
- `menu` text cannot be null or empty
- Maximum 3 images per menu (enforced in application layer)
- Deletion cascades from business (if business deleted, all menus deleted)

**Image Storage**:

- URLs point to Supabase Storage bucket `menu-images`
- Images stored as: `menu/{timestamp}-{filename}`
- Public URLs accessible for displaying in app

## Data Types

### UUID (Universally Unique Identifier)

- **Type**: PostgreSQL `uuid`
- **Format**: `123e4567-e89b-12d3-a456-426614174000`
- **Usage**: All primary and foreign keys
- **Benefit**: Non-sequential, globally unique, cannot be enumerated

### VARCHAR(n)

- **Type**: PostgreSQL `varchar(n)`
- **Examples**:
  - `name VARCHAR(255)` - Business name
  - `name VARCHAR NOT NULL` - Profile name
- **Benefit**: Enforces maximum length at database level

### TEXT

- **Type**: PostgreSQL `text`
- **Usage**: Unlimited length text fields
- **Examples**:
  - `description TEXT` - Business description
  - `menu TEXT` - Menu items text
- **Benefit**: No arbitrary length limits

### TEXT[] (Array)

- **Type**: PostgreSQL `text[]`
- **Usage**: Array of text values
- **Example**: `images TEXT[]` - Array of image URLs
- **Operations**:

  ```sql
  -- Add image
  UPDATE menu SET images = array_append(images, 'url')

  -- Remove image
  UPDATE menu SET images = array_remove(images, 'url')

  -- Check if contains
  SELECT * FROM menu WHERE 'url' = ANY(images)
  ```

### DOUBLE PRECISION

- **Type**: PostgreSQL `double precision`
- **Usage**: Geographic coordinates
- **Range**: -180 to 180 (longitude), -90 to 90 (latitude)
- **Benefit**: High precision for geographic data

### TIMESTAMPTZ

- **Type**: PostgreSQL `timestamp with time zone`
- **Usage**: Created and updated timestamps
- **Default**: `NOW()` at insertion
- **Benefit**: Time zone aware, standardized to UTC

## Relationships

### One-to-One: auth.users ↔ profiles

- **Type**: Reference integrity
- **Rule**: Each auth.users has at most one profile
- **Cascade**: Deleting auth.users deletes profile
- **Use Case**: Extending Supabase Auth with app-specific data

### One-to-Many: profiles ↔ business

- **Type**: Foreign Key
- **Rule**: One user owns many businesses
- **Query**: Find all businesses for user
  ```sql
  SELECT * FROM business WHERE user_id = 'user-id'
  ```
- **Cascade**: Deleting profile deletes all its businesses

### One-to-Many: business ↔ menu

- **Type**: Foreign Key
- **Rule**: One business has many menus
- **Query**: Find all menus for business
  ```sql
  SELECT * FROM menu WHERE business_id = 'business-id'
  ```
- **Cascade**: Deleting business deletes all its menus

## Database Constraints

### Primary Key Constraints

- Every table has a UUID primary key
- Prevents duplicate rows
- Enables fast lookups

### Foreign Key Constraints

- `business.user_id` → `profiles.id`
- `menu.business_id` → `business.id`
- Prevents orphaned records
- With `ON DELETE CASCADE`: Automatic cleanup

### Not Null Constraints

- Core fields marked NOT NULL
- Enforced at database level
- Application layer also validates

### Default Value Constraints

- `created_at` and `updated_at` default to `NOW()`
- `images` defaults to empty array `'{}'`
- Database generates values automatically

### Custom Length Constraints

- Validated in application layer
- Database enforces varchar limits
- Examples:
  - Business name: 1-255 characters
  - Description: 1-1000 characters
  - Menu images: maximum 3

## Indexing Strategy

### Indexes for Filtering

```sql
-- Fast queries by user
CREATE INDEX idx_business_user_id ON business(user_id);

-- Fast queries by business
CREATE INDEX idx_menu_business_id ON menu(business_id);
```

### Indexes for Sorting

```sql
-- Efficient sorting by creation time
CREATE INDEX idx_business_created_at ON business(created_at DESC);
CREATE INDEX idx_menu_created_at ON menu(created_at DESC);
```

### Indexes for Geographic Queries (Future)

```sql
-- For proximity searches (when implemented)
CREATE INDEX idx_business_location ON business(longitude, latitude);
```

## Sample Queries

### Get User's Businesses

```sql
SELECT * FROM business
WHERE user_id = 'profile-id'
ORDER BY created_at DESC;
```

### Get Business with All Menus

```sql
SELECT
  b.*,
  json_agg(m.* ORDER BY m.created_at DESC) as menus
FROM business b
LEFT JOIN menu m ON m.business_id = b.id
WHERE b.id = 'business-id'
GROUP BY b.id;
```

### Get User Profile with Business Count

```sql
SELECT
  p.*,
  COUNT(b.id) as business_count
FROM profiles p
LEFT JOIN business b ON b.user_id = p.id
WHERE p.id = 'profile-id'
GROUP BY p.id;
```

### Find Businesses in Geographic Area (Future)

```sql
-- Find businesses within bounding box
SELECT * FROM business
WHERE longitude BETWEEN -122.5 AND -122.4
  AND latitude BETWEEN 37.7 AND 37.8
ORDER BY created_at DESC;
```

## Migration from Old Schema

**Removed Tables**:

- `users` table → Replaced by Supabase `auth.users` + `profiles` table
- `user_identities` table → OAuth identities managed by Supabase Auth directly

**Relationship Changes**:

- Old: `business.user_id → users.id`
- New: `business.user_id → profiles.id` (which references `auth.users.id`)

**Cascade Behavior**:

- Old: Manual cleanup required
- New: Automatic cascade on delete through foreign keys

## Performance Considerations

### Current Queries

- Simple CRUD operations: O(1) with PK lookup
- Filter by user_id: O(n) with index (fast)
- Cascade deletes: Handled by database efficiently

### Future Optimizations

- Pagination limits for large result sets
- Denormalization if needed (e.g., business_count in profile)
- Caching for frequently accessed data
- Connection pooling for high concurrency

## Row Level Security (RLS)

For production, consider Supabase RLS policies:

```sql
-- Users can only see their own profiles
CREATE POLICY "Users can see own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only see their own businesses
CREATE POLICY "Users can see own businesses"
  ON business FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only modify their own businesses
CREATE POLICY "Users can modify own businesses"
  ON business FOR UPDATE
  USING (auth.uid() = user_id);
```

Currently, ownership is enforced in the application layer (service layer checks ownership).

## References

- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)

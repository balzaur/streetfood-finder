# Backend Database Architecture

## Overview

The Ultimate Street Food Finder backend uses a clean, layered architecture that separates concerns and maintains clear boundaries between data access and business logic. The application is built on Node.js with Express and integrates with Supabase (managed PostgreSQL) as the primary database.

**Architecture Flow:**

```
HTTP Request → Routes → Controllers → Services → Supabase (PostgreSQL)
```

This separation ensures:

- **Testability**: Services can be tested independently of HTTP concerns
- **Maintainability**: Changes to database logic don't affect controller code
- **Scalability**: Easy to add caching, background jobs, or additional data sources
- **Type Safety**: TypeScript interfaces ensure data contracts across layers

The Node.js backend communicates with Supabase via the `@supabase/supabase-js` client library, which provides both SQL query building and real-time subscriptions (when needed). All database operations are performed in the service layer, keeping controllers focused solely on HTTP request/response handling.

## Database Design Philosophy

The database schema is intentionally minimal and normalized, reflecting a startup-friendly approach:

**Small and Focused**: Only four core tables support the MVP feature set (users, businesses, menus, authentication). This reduces complexity and makes the system easier to reason about during rapid iteration.

**Normalized**: Each table has a single, clear responsibility. User data is separate from business data, which is separate from menu data. This prevents data duplication and maintains referential integrity through foreign keys.

**Clarity Over Premature Optimization**: Rather than denormalizing for performance or adding complex indexing strategies upfront, the schema prioritizes understandability. Performance optimizations (materialized views, read replicas, caching) can be added when metrics justify them.

**Startup-Friendly**: The schema can evolve as product requirements change. Adding new features (reviews, orders, payments) doesn't require restructuring existing tables. Each table uses UUIDs for primary keys, making it safe to expose IDs publicly and simplifying data migration or multi-region setups in the future.

This philosophy acknowledges that at early stages, developer velocity and code clarity are more valuable than micro-optimizations. The schema can handle thousands of users and businesses without modification, and scaling strategies are straightforward when needed.

## Tables Overview

The database consists of four core tables:

**users**: Stores user account information. Each user represents a vendor or business owner who can manage one or more street food businesses.

**business**: Represents physical street food vendors/stalls. Each business belongs to a user and has location data (latitude/longitude) for map display.

**menu**: Stores menu items for each business. Each menu entry includes text description and up to 3 product images. Multiple menus per business are supported to accommodate daily specials or seasonal offerings.

**user_identities**: Tracks OAuth provider identities (currently Facebook) linked to user accounts. Supports social login and allows a single user to have multiple authentication methods.

## Entity Relationships

The schema follows a hierarchical structure with clear parent-child relationships:

```
users (id)
  ├── business (user_id FK) [1-to-many]
  │     └── menu (business_id FK) [1-to-many]
  │
  └── user_identities (user_id FK) [1-to-many]
```

**Relationship Details:**

**users → business**: One user can own multiple businesses (e.g., a vendor with multiple stalls in different locations). The `business.user_id` foreign key enforces referential integrity with `ON DELETE CASCADE`, meaning deleting a user automatically removes all their businesses.

**business → menu**: One business can have multiple menu entries (daily menus, seasonal items, different product categories). The `menu.business_id` foreign key with `ON DELETE CASCADE` ensures menus are automatically removed when a business is deleted.

**users → user_identities**: One user can have multiple OAuth identities (future support for Google, Apple Sign-In, etc.). Currently focused on Facebook login. The `user_identities.user_id` foreign key with `ON DELETE CASCADE` removes all authentication methods when a user account is deleted.

**Cascade Behavior**: All foreign keys use `ON DELETE CASCADE` to maintain data integrity automatically. When a user is deleted, PostgreSQL removes all associated businesses, which in turn removes all menus. This prevents orphaned records and simplifies application logic.

## Table Breakdown

### users

**Purpose**: Central user account table for business owners and vendors.

**Schema:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Columns:**

- `id` (UUID): Primary key using PostgreSQL's `gen_random_uuid()`. UUIDs prevent ID enumeration attacks and are safe to expose in public APIs.
- `name` (VARCHAR): User's display name. Required field, no maximum length constraint to support international names.
- `created_at`, `updated_at` (TIMESTAMPTZ): Audit timestamps with timezone awareness for accurate global time tracking.

**Design Rationale:**

- **Minimal fields**: Only essential user data is stored. Additional profile fields (avatar, bio, contact info) can be added as needed without breaking existing functionality.
- **No email/password**: Authentication is handled via OAuth providers (tracked in `user_identities`). This reduces security liability and simplifies user onboarding.
- **VARCHAR vs TEXT**: Using `VARCHAR` for name signals it's a short field, though PostgreSQL treats both identically. Future migrations might add length constraints.

**Delete Behavior**: Deleting a user cascades to all related tables (`business`, `menu`, `user_identities`), completely removing the user's presence from the system.

**Future Extensibility:**

- Add `phone`, `email`, `avatar_url` columns
- Add `is_verified` boolean for verified vendors
- Add `subscription_tier` for premium features
- Add `location_preferences` JSONB for saved areas

### business

**Purpose**: Represents individual street food vendors, stalls, or mobile food businesses.

**Schema:**

```sql
CREATE TABLE business (
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

CREATE INDEX idx_business_user_id ON business(user_id);
```

**Key Columns:**

- `id` (UUID): Primary key for the business.
- `user_id` (UUID FK): Links to the owning user. Indexed for efficient user-to-business lookups.
- `name` (VARCHAR): Business name (e.g., "Tito's Taco Stand").
- `description` (TEXT): Optional long-form description of the business, specialties, or story.
- `image` (TEXT): URL to a single storefront or hero image stored in Supabase Storage.
- `longitude`, `latitude` (DOUBLE PRECISION): Geolocation coordinates for map display. Required fields validated on input (-180 to 180 for longitude, -90 to 90 for latitude).

**Design Rationale:**

- **DOUBLE PRECISION for coordinates**: Provides ~15 decimal digits of precision, sufficient for meter-level accuracy in geolocation.
- **TEXT for image URL**: Stores the public URL returned by Supabase Storage. URLs are typically under 200 characters but TEXT accommodates any length.
- **Single image**: One storefront photo keeps the schema simple. Additional images (interior, food photos) are stored in the `menu` table.
- **No address field**: MVP focuses on map-based discovery. Address can be added later if needed for search/delivery.

**Delete Behavior**: Cascades to all associated `menu` records. The business image in Supabase Storage is NOT automatically deleted (handled by application logic for cleanup).

**Future Extensibility:**

- Add `is_open` boolean for real-time operational status
- Add `hours_of_operation` JSONB for scheduling
- Add `cuisine_type`, `price_range` for filtering
- Add `rating` NUMERIC and `review_count` INTEGER for aggregated ratings
- Add PostGIS extension for advanced geospatial queries (nearby search, radius queries)

### menu

**Purpose**: Stores menu items/offerings for each business with product images.

**Schema:**

```sql
CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  menu TEXT NOT NULL,
  images TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_business_id ON menu(business_id);
```

**Key Columns:**

- `id` (UUID): Primary key for the menu entry.
- `business_id` (UUID FK): Links to parent business. Indexed for efficient menu retrieval.
- `menu` (TEXT): Menu item descriptions, pricing, or any text content. Flexible format allows vendors to structure content as needed.
- `images` (TEXT[]): Array of image URLs (max 3). PostgreSQL arrays provide native support without needing a junction table.

**Design Rationale:**

- **TEXT[] for images**: Native array type is simpler than a separate `menu_images` table for a fixed maximum (3 images). Validation logic enforces the limit.
- **Why arrays**: Direct array access in queries is efficient, and most menus won't need complex image manipulation. If requirements change (ordering, captions), migration to a junction table is straightforward.
- **TEXT for menu content**: Unstructured text gives vendors flexibility. Future iterations might add structured fields (item name, price, description) or JSONB for complex menu structures.
- **Multiple menu rows per business**: Supports use cases like daily specials, seasonal menus, or different product categories without schema changes.

**Delete Behavior**: Automatically deleted when parent business is removed. Application logic handles deletion of associated images from Supabase Storage.

**Future Extensibility:**

- Split into structured fields: `item_name`, `price`, `description`, `category`
- Add `is_available` boolean for sold-out items
- Add `dietary_tags` TEXT[] for allergen/dietary information
- Add `display_order` INTEGER for menu organization
- Migrate to JSONB for complex nested menu structures (combo meals, customizations)

### user_identities

**Purpose**: Maps OAuth provider identities to user accounts for social login.

**Schema:**

```sql
CREATE TABLE user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX idx_user_identities_provider ON user_identities(provider, provider_user_id);
```

**Key Columns:**

- `id` (UUID): Primary key for the identity record.
- `user_id` (UUID FK): Links to the local user account.
- `provider` (TEXT): OAuth provider name (e.g., "facebook", "google"). TEXT allows flexibility for any provider string.
- `provider_user_id` (TEXT): Unique identifier from the OAuth provider (e.g., Facebook user ID).
- `provider_email` (TEXT): Email address from the provider, if available. Nullable since not all providers guarantee email.

**Design Rationale:**

- **UNIQUE(provider, provider_user_id)**: Ensures one identity record per provider account. Prevents duplicate logins and enforces idempotency in the Facebook login endpoint.
- **Separate from users table**: Supports linking multiple OAuth providers to one account without cluttering the users table or requiring nullable columns.
- **TEXT types**: OAuth IDs and emails can be arbitrarily long and contain special characters. TEXT accommodates all cases.
- **Nullable email**: Some OAuth flows don't provide email (user declined permission), so it's optional.

**Delete Behavior**: Automatically removed when the parent user is deleted. No cascade to other tables.

**Future Extensibility:**

- Add `provider_token` TEXT for storing refresh tokens (encrypted)
- Add `token_expires_at` TIMESTAMPTZ for token lifecycle management
- Add `provider_metadata` JSONB for additional OAuth data
- Support Apple Sign-In, Google, Twitter, etc.

## Supabase Storage Architecture

The backend uses Supabase Storage for managing menu images, keeping binary data out of the database and leveraging CDN capabilities.

**Storage Flow:**

1. Client uploads images via multipart form data to the backend API
2. Backend validates files (type, size, count) using Multer middleware
3. Backend uploads files to Supabase Storage bucket using service role credentials
4. Supabase returns public CDN URLs for each uploaded image
5. Backend stores URLs in the `menu.images` array in PostgreSQL
6. On menu deletion, backend deletes images from Storage bucket

**Why Image URLs Instead of Blobs:**

- **Performance**: Serving images from Supabase's CDN is faster than database BLOBs and reduces database load
- **Scalability**: Storage buckets can scale independently of the database
- **Simplicity**: URLs in TEXT fields are easier to work with in queries and application code
- **Global Distribution**: Supabase Storage uses a CDN, providing low-latency image delivery worldwide
- **Cost**: Storage is cheaper than database space for large binary files

**Storage Bucket Configuration:**

- **Bucket name**: `menu-images` (configurable via environment variable)
- **Access**: Public bucket for read access, service role for write/delete operations
- **Structure**: Images stored with timestamp prefixes to prevent name collisions (`menu/1736419200000-taco.jpg`)

**Security Approach:**

- **Backend-controlled uploads**: Clients never receive direct Storage credentials. All uploads go through the API, which validates and sanitizes inputs.
- **Service role key**: Backend uses Supabase service role key (bypasses RLS) to upload/delete files. This key is never exposed to clients.
- **File validation**: Multer middleware enforces file type (images only), size limits (5MB), and count limits (max 3).
- **Cleanup on errors**: If menu creation fails after images are uploaded, the backend deletes orphaned images to prevent storage bloat.

**Future Considerations:**

- Add image processing (thumbnails, compression) using Supabase Edge Functions or a service like Cloudinary
- Implement signed upload URLs for direct client-to-storage uploads (reduces backend load)
- Add business storefront images to a separate bucket or folder
- Implement lifecycle policies to delete old images after menu deletions

## Security Considerations

The backend implements multiple security layers to protect data and prevent unauthorized access.

**Service Role vs Anon Clients:**

The application uses two Supabase clients with different permission levels:

**Anon Client** (`supabaseAnon`):

- Uses the publishable anon key
- Respects Row Level Security (RLS) policies
- Safe for read operations when RLS is enabled
- Currently not used in API but available for future frontend integration

**Service Role Client** (`supabaseAdmin`):

- Uses the service role key (secret)
- Bypasses RLS entirely
- Used for all backend operations (inserts, updates, deletes)
- Never exposed to clients

This separation allows the backend to perform privileged operations while keeping RLS policies in place for future direct client access (e.g., Supabase Realtime subscriptions from mobile apps).

**Row Level Security (RLS) Readiness:**

While the current backend bypasses RLS, the schema is designed for easy RLS implementation:

- Each table has clear ownership (via `user_id` or `business_id`)
- Future RLS policies can restrict:
  - Users can only read/update their own data
  - Business owners can only modify their businesses
  - Menu edits restricted to business owners

RLS policies can be added without backend code changes, providing an additional security layer.

**Ownership Verification:**

All business and menu operations verify ownership in the service layer before allowing modifications:

```typescript
// Example: getBusinessById checks that business belongs to user
const business = await supabaseAdmin
  .from("business")
  .select("*")
  .eq("id", businessId)
  .eq("user_id", userId) // Ownership check
  .single();
```

If ownership check fails, the service throws a `NotFoundError` (404) rather than `ForbiddenError` (403). This prevents attackers from discovering which business IDs exist in the system.

**Preventing Data Leaks:**

- **UUID primary keys**: Not sequential, can't be enumerated to discover all records
- **404 for unauthorized access**: Ownership failures return "not found" rather than "forbidden", hiding resource existence
- **Input validation**: Zod schemas validate all inputs before database queries, preventing injection attacks
- **No raw SQL**: Using Supabase's query builder prevents SQL injection
- **Environment variables**: Database credentials never hardcoded in source

**Future Security Enhancements:**

- Add authentication middleware to verify user identity on protected routes
- Implement rate limiting to prevent abuse
- Add request logging for security audits
- Enable RLS policies as defense-in-depth
- Add CSRF protection for stateful operations

## Scalability Considerations

The database schema is designed to handle growth in users, businesses, and data volume without requiring restructuring.

**UUID Usage:**

All primary keys use UUIDs (`gen_random_uuid()`) rather than auto-incrementing integers:

**Benefits:**

- **Distributed systems**: Safe to generate IDs in multiple application instances or regions without coordination
- **Merging databases**: No ID conflicts when migrating data or merging datasets
- **Security**: Non-sequential IDs prevent enumeration attacks and don't leak information about record counts
- **Public exposure**: Safe to use in URLs and API responses without revealing business metrics

**Trade-offs:**

- Slightly larger index size (16 bytes vs 4-8 bytes for integers)
- No natural ordering (mitigated by `created_at` timestamps)

For this application's scale, UUID benefits outweigh the minimal storage cost.

**Multiple Businesses Per User:**

The `business` table supports one user owning multiple locations:

- A street food vendor with stalls in different areas
- A franchisee managing multiple franchise units
- A food truck operator with multiple vehicles

This design accommodates growth without schema changes. Queries remain efficient due to the `idx_business_user_id` index.

**Extensibility for Advanced Features:**

The schema provides natural extension points for common feature requests:

**Ratings and Reviews:**

```sql
-- Future table, no changes to existing schema
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Orders and Transactions:**

```sql
-- Future table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES business(id),
  customer_user_id UUID REFERENCES users(id),
  items JSONB,
  total_amount NUMERIC(10,2),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Performance Optimization Opportunities:**

When scale requires optimization:

- **Indexes**: Add indexes on frequently queried columns (`business.latitude`, `business.longitude` for geo queries)
- **Materialized views**: Pre-aggregate business ratings, menu counts
- **Partitioning**: Partition large tables by date if order history grows significantly
- **Read replicas**: Separate read and write workloads
- **Caching**: Add Redis for frequently accessed data (business listings, popular menus)

The current schema supports thousands of users and businesses without these optimizations.

## Summary

The Ultimate Street Food Finder database architecture prioritizes clarity, maintainability, and extensibility over premature optimization. With only four tables, it supports the core MVP feature set while providing natural extension points for future features like reviews, orders, and advanced search.

Key architectural decisions:

- **UUIDs for primary keys**: Support distributed systems and prevent enumeration
- **Normalized schema**: Each table has a single responsibility with clear relationships
- **Cascade deletions**: Foreign keys automatically maintain referential integrity
- **Supabase Storage integration**: Efficient image handling with CDN delivery
- **Service layer ownership checks**: Security enforced in application code with RLS readiness
- **Minimal field set**: Only essential data stored, easy to extend as needs evolve

This architecture supports rapid iteration during the startup phase while maintaining a foundation that scales to thousands of users without requiring restructuring. When metrics justify optimization, clear extension points exist for caching, indexing, and advanced features.

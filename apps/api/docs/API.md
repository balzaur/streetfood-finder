# Ultimate Street Food Finder - API Documentation

## Base URL

```
http://localhost:4000
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 100
    }
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... }
  }
}
```

## Error Codes

| Code                  | HTTP Status | Description               |
| --------------------- | ----------- | ------------------------- |
| `VALIDATION_ERROR`    | 400         | Request validation failed |
| `BAD_REQUEST`         | 400         | Invalid request           |
| `UNAUTHORIZED`        | 401         | Authentication required   |
| `FORBIDDEN`           | 403         | Insufficient permissions  |
| `NOT_FOUND`           | 404         | Resource not found        |
| `CONFLICT`            | 409         | Resource conflict         |
| `INTERNAL_ERROR`      | 500         | Internal server error     |
| `NOT_IMPLEMENTED`     | 501         | Feature not implemented   |
| `SERVICE_UNAVAILABLE` | 503         | Service unavailable       |

---

## Authentication

This API uses Firebase Authentication for user identity verification (optional). When configured, include the Firebase ID token in requests:

```
Authorization: Bearer <firebase-id-token>
```

If Firebase is not configured, authentication endpoints will return `501 Not Implemented`.

---

## Endpoints

### 1. Users

#### 1.1 Facebook Login (Create or Get User)

Creates a new user via Facebook login or returns existing user (idempotent).

**Endpoint:** `POST /api/v1/users/facebook`

**Request Body:**

```json
{
  "name": "Juan Dela Cruz",
  "provider": "facebook",
  "provider_user_id": "fb_123456",
  "provider_email": "juan@email.com"
}
```

**Response (201 Created - New User):**

```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Dela Cruz",
      "created_at": "2026-01-09T10:00:00.000Z",
      "updated_at": "2026-01-09T10:00:00.000Z"
    },
    "identity": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "provider": "facebook",
      "provider_user_id": "fb_123456",
      "provider_email": "juan@email.com",
      "created_at": "2026-01-09T10:00:00.000Z",
      "updated_at": "2026-01-09T10:00:00.000Z"
    }
  }
}
```

**Response (200 OK - Existing User):**

```json
{
  "data": {
    "user": { ... },
    "identity": { ... }
  }
}
```

---

#### 1.2 Get User by ID

Retrieves a specific user by ID.

**Endpoint:** `GET /api/v1/users/:id`

**Response (200 OK):**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Dela Cruz",
    "created_at": "2026-01-09T10:00:00.000Z",
    "updated_at": "2026-01-09T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - User not found

---

#### 1.3 Get All Users

Retrieves all users with optional pagination.

**Endpoint:** `GET /api/v1/users`

**Query Parameters:**

- `limit` (optional): Number of users to return (default: 50, max: 200)
- `offset` (optional): Number of users to skip (default: 0)

**Example:** `GET /api/v1/users?limit=20&offset=0`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Dela Cruz",
      "created_at": "2026-01-09T10:00:00.000Z",
      "updated_at": "2026-01-09T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150
    }
  }
}
```

---

#### 1.4 Update User

Updates user information (name only).

**Endpoint:** `POST /api/v1/users/:id`

**Request Body:**

```json
{
  "name": "Juan P. Dela Cruz"
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan P. Dela Cruz",
    "created_at": "2026-01-09T10:00:00.000Z",
    "updated_at": "2026-01-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `404 Not Found` - User not found

---

#### 1.5 Delete User

Deletes a user and all related data (business, menu, identities).

**Endpoint:** `DELETE /api/v1/users/:id`

**Response (204 No Content)**

**Error Responses:**

- `404 Not Found` - User not found

---

### 2. Business

#### 2.1 Create Business

Creates a business for a specific user.

**Endpoint:** `POST /api/v1/users/:userId/business`

**Request Body:**

```json
{
  "name": "Tito's Taco Stand",
  "description": "Best tacos in Manila!",
  "image": "https://example.com/storefront.jpg",
  "longitude": 121.0244,
  "latitude": 14.5547
}
```

**Field Validations:**

- `name` (required): 1-255 characters
- `description` (optional): Max 1000 characters
- `image` (optional): Valid URL
- `longitude` (required): -180 to 180
- `latitude` (required): -90 to 90

**Response (201 Created):**

```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tito's Taco Stand",
    "description": "Best tacos in Manila!",
    "image": "https://example.com/storefront.jpg",
    "longitude": 121.0244,
    "latitude": 14.5547,
    "created_at": "2026-01-09T11:00:00.000Z",
    "updated_at": "2026-01-09T11:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `404 Not Found` - User not found

---

#### 2.2 Get Businesses for User

Retrieves all businesses owned by a specific user.

**Endpoint:** `GET /api/v1/users/:userId/business`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tito's Taco Stand",
      "description": "Best tacos in Manila!",
      "image": "https://example.com/storefront.jpg",
      "longitude": 121.0244,
      "latitude": 14.5547,
      "created_at": "2026-01-09T11:00:00.000Z",
      "updated_at": "2026-01-09T11:00:00.000Z"
    }
  ]
}
```

---

#### 2.3 Update Business

Updates business information (ownership check enforced).

**Endpoint:** `POST /api/v1/users/:userId/business/:businessId`

**Request Body (all fields optional):**

```json
{
  "name": "Tito's Amazing Taco Stand",
  "description": "The best tacos in all of Manila!",
  "image": "https://example.com/new-storefront.jpg",
  "longitude": 121.025,
  "latitude": 14.555
}
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tito's Amazing Taco Stand",
    "description": "The best tacos in all of Manila!",
    "image": "https://example.com/new-storefront.jpg",
    "longitude": 121.025,
    "latitude": 14.555,
    "created_at": "2026-01-09T11:00:00.000Z",
    "updated_at": "2026-01-09T11:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `404 Not Found` - Business not found or doesn't belong to user

---

#### 2.4 Delete Business

Deletes a business (ownership check enforced).

**Endpoint:** `DELETE /api/v1/users/:userId/business/:businessId`

**Response (204 No Content)**

**Error Responses:**

- `404 Not Found` - Business not found or doesn't belong to user

---

### 3. Menu

#### 3.1 Create Menu with Images

Creates a menu for a business with image uploads.

**Endpoint:** `POST /api/v1/business/:businessId/menu`

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `menu` (text, required): Menu description/text
- `images` (files, required): 1-3 image files (max 5MB each)

**Example using cURL:**

```bash
curl -X POST http://localhost:4000/api/v1/business/:businessId/menu \
  -F "menu=Beef Taco - $5, Chicken Taco - $4" \
  -F "images=@taco1.jpg" \
  -F "images=@taco2.jpg" \
  -F "images=@taco3.jpg"
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "business_id": "770e8400-e29b-41d4-a716-446655440000",
    "menu": "Beef Taco - $5, Chicken Taco - $4",
    "images": [
      "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736419200000-taco1.jpg",
      "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736419200001-taco2.jpg",
      "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736419200002-taco3.jpg"
    ],
    "created_at": "2026-01-09T12:00:00.000Z",
    "updated_at": "2026-01-09T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error (missing menu text, no images, >3 images, non-image files)
- `404 Not Found` - Business not found

---

#### 3.2 Get Menus for Business

Retrieves all menus for a specific business.

**Endpoint:** `GET /api/v1/business/:businessId/menu`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "business_id": "770e8400-e29b-41d4-a716-446655440000",
      "menu": "Beef Taco - $5, Chicken Taco - $4",
      "images": [
        "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736419200000-taco1.jpg",
        "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736419200001-taco2.jpg"
      ],
      "created_at": "2026-01-09T12:00:00.000Z",
      "updated_at": "2026-01-09T12:00:00.000Z"
    }
  ]
}
```

---

#### 3.3 Update Menu

Updates menu text and/or replaces images. Old images are deleted when new ones are uploaded.

**Endpoint:** `POST /api/v1/business/:businessId/menu/:menuId`

**Content-Type:** `multipart/form-data`

**Form Fields (all optional, but at least one required):**

- `menu` (text): Updated menu description
- `images` (files): New images (1-3 files, max 5MB each)

**Example using cURL:**

```bash
curl -X POST http://localhost:4000/api/v1/business/:businessId/menu/:menuId \
  -F "menu=Beef Taco - $6, Chicken Taco - $5, Fish Taco - $7" \
  -F "images=@new-taco1.jpg"
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "business_id": "770e8400-e29b-41d4-a716-446655440000",
    "menu": "Beef Taco - $6, Chicken Taco - $5, Fish Taco - $7",
    "images": [
      "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/menu/1736422800000-new-taco1.jpg"
    ],
    "created_at": "2026-01-09T12:00:00.000Z",
    "updated_at": "2026-01-09T13:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error (no updates provided, >3 images)
- `404 Not Found` - Menu not found or doesn't belong to business

---

#### 3.4 Delete Menu

Deletes a menu and all associated images.

**Endpoint:** `DELETE /api/v1/business/:businessId/menu/:menuId`

**Response (204 No Content)**

**Error Responses:**

- `404 Not Found` - Menu not found or doesn't belong to business

---

### 4. User Identities

#### 4.1 Create User Identity

Creates a user identity record for Facebook authentication. Optionally verifies Firebase ID token if configured.

**Endpoint:** `POST /api/v1/user-identities`

**Headers (optional):**

```
Authorization: Bearer <firebase-id-token>
```

**Request Body:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider_user_id": "fb_123456",
  "provider_email": "juan@email.com"
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "facebook",
    "provider_user_id": "fb_123456",
    "provider_email": "juan@email.com",
    "created_at": "2026-01-09T14:00:00.000Z",
    "updated_at": "2026-01-09T14:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid or mismatched Firebase token
- `404 Not Found` - User not found
- `501 Not Implemented` - Firebase authentication not configured

---

#### 4.2 Delete User Identity

Deletes a user identity record.

**Endpoint:** `DELETE /api/v1/user-identities/:id`

**Response (204 No Content)**

**Error Responses:**

- `404 Not Found` - User identity not found

---

## Image Upload Specifications

### Menu Images

- **Bucket:** `menu-images` (Supabase Storage)
- **Max files:** 3 per menu
- **Max size:** 5MB per file
- **Accepted formats:** All image MIME types (image/\*)
- **Storage path:** `menu/{timestamp}-{filename}`

### Upload Behavior

- Images are uploaded to Supabase Storage before database records are created
- If database insert fails, uploaded images are automatically cleaned up
- When updating with new images, old images are deleted
- When deleting a menu, all associated images are deleted

---

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Server Configuration
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase Configuration
SUPABASE_URL=https://livjafablrkxszdfrsrb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_XvH7ZAQKm1L6iVpbtnvp3A_62qjdA0w
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Storage
SUPABASE_STORAGE_BUCKET_MENU_IMAGES=menu-images

# Firebase Authentication (Optional)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Database Schema

For complete database design, entity relationships, and table details, see [Backend Database Architecture](./backend-database-architecture.md).

**Quick reference - Four core tables:**

- `users` - User accounts for vendors
- `business` - Street food vendor businesses with geolocation
- `menu` - Menu items with images (max 3 per menu)
- `user_identities` - OAuth provider identities (Facebook, future: Google, Apple)

---

## Testing with cURL

### 1. Create User via Facebook

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

### 2. Create Business

```bash
curl -X POST http://localhost:4000/api/v1/users/{userId}/business \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Titos Taco Stand",
    "description": "Best tacos in Manila!",
    "longitude": 121.0244,
    "latitude": 14.5547
  }'
```

### 3. Create Menu with Images

```bash
curl -X POST http://localhost:4000/api/v1/business/{businessId}/menu \
  -F "menu=Beef Taco - $5, Chicken Taco - $4" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### 4. Get All Users

```bash
curl http://localhost:4000/api/v1/users?limit=10&offset=0
```

---

## Architecture Overview

### Request Flow

```
Request → Routes → Middleware (Validation) → Controller → Service → Database
```

**For detailed architecture, layer responsibilities, and design patterns**, see [Backend Tech Stack Documentation](./backend-tech-stack.md#layered-architecture-with-separation-of-concerns).

### API Standards

- **Error Handling**: Consistent error codes and HTTP status mapping (see Error Codes section above)
- **Input Validation**: Zod schemas validate all requests
- **Security**: Helmet headers, CORS, JWT support, Supabase RLS
- **Response Format**: All responses follow consistent JSON structure with `data` and `meta` fields

---

## Development

### Start Development Server

```bash
cd apps/api
pnpm dev
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update `SUPABASE_SERVICE_ROLE_KEY` with your actual key
3. (Optional) Configure Firebase credentials for authentication

### Type Checking

```bash
pnpm typecheck
```

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Production Considerations

1. **Rate Limiting**: Implement rate limiting middleware (already installed: `express-rate-limit`)
2. **Authentication**: Add proper JWT/session-based authentication
3. **Logging**: Add structured logging (Winston, Pino)
4. **Monitoring**: Add APM and error tracking (Sentry, New Relic)
5. **Database**: Configure Supabase RLS policies
6. **Storage**: Set up proper Supabase Storage bucket policies
7. **CORS**: Restrict CORS to specific origins in production
8. **SSL/TLS**: Use HTTPS in production
9. **Validation**: Additional business rule validation
10. **Testing**: Add unit and integration tests (Jest, Vitest, Supertest)

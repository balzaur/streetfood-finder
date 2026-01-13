# Ultimate Street Food Finder - API Documentation

## Base URL

```
http://localhost:4000
```

## Response Format

### Success Response

```json
{
  "data": { ... }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Error Codes

| Code               | HTTP Status | Description               |
| ------------------ | ----------- | ------------------------- |
| `VALIDATION_ERROR` | 400         | Request validation failed |
| `BAD_REQUEST`      | 400         | Invalid request           |
| `UNAUTHORIZED`     | 401         | Authentication required   |
| `FORBIDDEN`        | 403         | Insufficient permissions  |
| `NOT_FOUND`        | 404         | Resource not found        |
| `CONFLICT`         | 409         | Resource conflict         |
| `INTERNAL_ERROR`   | 500         | Internal server error     |

---

## Authentication

This API uses **Supabase Auth exclusively** with JWT verification. All authenticated endpoints require a valid Supabase JWT token:

```
Authorization: Bearer <supabase-jwt>
```

See [AUTH.md](./AUTH.md) for complete authentication flow documentation.

---

## Endpoints

### Health Check

#### Get Health Status

**Endpoint:** `GET /health`

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-01-13T15:16:18.854Z",
  "environment": "development"
}
```

---

### Vendors (Public)

#### Get All Vendors

Retrieves all available food vendors. This is mock data and does not require authentication.

**Endpoint:** `GET /api/v1/vendors`

**Response (200 OK):**

```json
[
  {
    "id": "1",
    "name": "Taco Fiesta Truck",
    "cuisine": "Mexican",
    "area": "Downtown",
    "rating": 4.8,
    "isOpen": true,
    "priceRange": "$$",
    "description": "Authentic Mexican tacos with fresh ingredients",
    "photoUrl": "https://images.unsplash.com/photo-1565299507177-b0ac66763828"
  }
]
```

---

### Business (Authenticated)

All business endpoints require authentication with a valid Supabase JWT token.

#### Create Business

**Endpoint:** `POST /api/v1/business`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

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
    "created_at": "2026-01-13T11:00:00.000Z",
    "updated_at": "2026-01-13T11:00:00.000Z"
  }
}
```

#### Get My Businesses

**Endpoint:** `GET /api/v1/business`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Tito's Taco Stand",
      "created_at": "2026-01-13T11:00:00.000Z",
      "updated_at": "2026-01-13T11:00:00.000Z"
    }
  ]
}
```

#### Get Single Business

**Endpoint:** `GET /api/v1/business/:businessId`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
```

#### Update Business

**Endpoint:** `PUT /api/v1/business/:businessId`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg",
  "longitude": 121.025,
  "latitude": 14.555
}
```

#### Delete Business

**Endpoint:** `DELETE /api/v1/business/:businessId`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
```

**Response (204 No Content)**

---

### Menu (Authenticated)

All menu endpoints require authentication with a valid Supabase JWT token.

#### Create Menu

**Endpoint:** `POST /api/v1/business/:businessId/menu`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
Content-Type: multipart/form-data
```

**Form Fields:**

- `menu` (text, required): Menu description/items
- `images` (files): 1-3 image files (max 5MB each)

**Example:**

```bash
curl -X POST http://localhost:4000/api/v1/business/<businessId>/menu \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "menu=Beef Taco - $5, Chicken Taco - $4" \
  -F "images=@taco1.jpg" \
  -F "images=@taco2.jpg"
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "business_id": "770e8400-e29b-41d4-a716-446655440000",
    "menu": "Beef Taco - $5, Chicken Taco - $4",
    "images": [
      "https://livjafablrkxszdfrsrb.supabase.co/storage/v1/object/public/menu-images/..."
    ],
    "created_at": "2026-01-13T12:00:00.000Z",
    "updated_at": "2026-01-13T12:00:00.000Z"
  }
}
```

#### Get Menus

**Endpoint:** `GET /api/v1/business/:businessId/menu`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
```

#### Update Menu

**Endpoint:** `POST /api/v1/business/:businessId/menu/:menuId`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
Content-Type: multipart/form-data
```

**Form Fields (at least one required):**

- `menu` (text): Updated menu description
- `images` (files): New images (1-3 files)

#### Delete Menu

**Endpoint:** `DELETE /api/v1/business/:businessId/menu/:menuId`

**Headers:**

```
Authorization: Bearer <supabase-jwt>
```

**Response (204 No Content)**

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Business Table

```sql
CREATE TABLE business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  image TEXT,
  longitude DOUBLE PRECISION NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Menu Table

```sql
CREATE TABLE menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  menu TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

Built with ❤️ using Node.js, Express, TypeScript, and Supabase

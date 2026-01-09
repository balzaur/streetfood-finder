# Ultimate Street Food Finder - API Server

Production-grade RESTful API built with Node.js, Express, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Navigate to API directory
cd apps/api

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
```

### Environment Configuration

Edit `.env` and update:

```env
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

Optional Firebase configuration for authentication:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Run Development Server

```bash
pnpm dev
```

Server will start at `http://localhost:4000`

### Verify Installation

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-01-09T10:00:00.000Z"
  }
}
```

## 📖 Documentation

### For Users

Comprehensive API documentation is available in [docs/API.md](./docs/API.md)

**Quick Links:**

- [Endpoints](./docs/API.md#endpoints)
- [Authentication](./docs/API.md#authentication)
- [Error Codes](./docs/API.md#error-codes)
- [Testing with cURL](./docs/API.md#testing-with-curl)
- [Database Schema](./docs/API.md#database-schema)

### For Developers

Backend architecture and technical documentation for onboarding engineers:

- **[Backend Database Architecture](./docs/backend-database-architecture.md)** - Database design philosophy, table relationships, security considerations, and scalability approach
- **[Backend Tech Stack & Libraries](./docs/backend-tech-stack.md)** - Detailed explanation of technologies, libraries, folder structure, and architectural decisions

**New to the project?** Start with the [Quick Start Guide](./docs/QUICK_START.md)

## 🏗️ Architecture

### Clean Architecture Pattern

```
Routes → Middleware → Controllers → Services → Database
```

### Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/
│   └── env.ts               # Environment variables & validation
├── controllers/             # HTTP request handlers
│   ├── users.controller.ts
│   ├── business.controller.ts
│   ├── menu.controller.ts
│   └── user-identities.controller.ts
├── services/                # Business logic & database operations
│   ├── users.service.ts
│   ├── business.service.ts
│   ├── menu.service.ts
│   └── user-identities.service.ts
├── routes/                  # API route definitions
│   ├── index.ts
│   ├── users.routes.ts
│   ├── business.routes.ts
│   ├── menu.routes.ts
│   └── user-identities.routes.ts
├── middlewares/             # Express middleware
│   ├── error.middleware.ts
│   ├── async-handler.ts
│   └── validate.middleware.ts
├── validators/              # Zod schemas for validation
│   └── index.ts
├── utils/                   # Utility functions
│   ├── api-response.ts
│   └── http-errors.ts
└── lib/                     # External service clients
    ├── supabase.ts
    └── firebase.ts
```

## 🔑 Key Features

### ✅ Implemented

- **Users Management** - Facebook login, CRUD operations
- **Business Management** - Create, read, update, delete businesses with geolocation
- **Menu Management** - Menus with multi-image uploads (max 3 images)
- **User Identities** - OAuth provider identity management
- **File Uploads** - Multer + Supabase Storage integration
- **Input Validation** - Zod schemas with detailed error messages
- **Error Handling** - Centralized error middleware with typed errors
- **Response Formatting** - Consistent API response structure
- **Pagination** - Query-based pagination for list endpoints
- **Type Safety** - Full TypeScript coverage
- **Security** - Helmet, CORS, input sanitization

### 🔐 Security

- Environment-based configuration (no hardcoded secrets)
- Supabase Service Role for server-side operations
- Firebase Authentication support (optional)
- Input validation on all endpoints
- Ownership verification for user resources
- Security headers via Helmet
- Configurable CORS

### 📦 File Upload

- Multipart form data support (Multer)
- Image validation (type, size, count)
- Automatic cleanup on errors
- Supabase Storage integration
- Public URL generation

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Production
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Run production build

# Type checking
pnpm typecheck        # Check types without emitting files

# Clean
pnpm clean            # Remove dist and node_modules
```

## 🗄️ Database

### Supabase Tables

- `users` - User accounts
- `business` - Business/vendor information
- `menu` - Menu items with images
- `user_identities` - OAuth provider identities

See [Database Schema](./docs/API.md#database-schema) for detailed structure.

### Setup Required

1. Create Supabase project at https://supabase.com
2. Run SQL migrations to create tables (see docs/API.md)
3. Create storage bucket: `menu-images`
4. Configure Row Level Security (RLS) policies
5. Update `.env` with credentials

## 🧪 Testing

### Manual Testing with cURL

**Create User:**

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

**Create Business:**

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

**Upload Menu with Images:**

```bash
curl -X POST http://localhost:4000/api/v1/business/{businessId}/menu \
  -F "menu=Beef Taco - $5, Chicken Taco - $4" \
  -F "images=@./image1.jpg" \
  -F "images=@./image2.jpg"
```

More examples in [docs/API.md](./docs/API.md#testing-with-curl)

### Automated Testing (Future)

- Jest/Vitest for unit tests
- Supertest for integration tests
- Test database setup
- Mock Supabase client

## 🚀 Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure Firebase credentials (if using auth)
- [ ] Set specific `CORS_ORIGIN` (not `*`)
- [ ] Enable rate limiting
- [ ] Set up logging (Winston/Pino)
- [ ] Configure monitoring (Sentry/New Relic)
- [ ] Use HTTPS/SSL
- [ ] Set up Supabase RLS policies
- [ ] Configure storage bucket policies
- [ ] Set up CI/CD pipeline
- [ ] Add health check monitoring

### Deployment Platforms

- **Vercel** - Zero-config deployment
- **Railway** - Simple container deployment
- **Render** - Managed Node.js hosting
- **AWS/GCP/Azure** - Full control with VMs or containers
- **Fly.io** - Edge deployment

## 📝 API Endpoints Overview

### Users

- `POST /api/v1/users/facebook` - Create/get user via Facebook
- `GET /api/v1/users` - List all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Business

- `POST /api/v1/users/:userId/business` - Create business
- `GET /api/v1/users/:userId/business` - Get user's businesses
- `POST /api/v1/users/:userId/business/:businessId` - Update business
- `DELETE /api/v1/users/:userId/business/:businessId` - Delete business

### Menu

- `POST /api/v1/business/:businessId/menu` - Create menu with images
- `GET /api/v1/business/:businessId/menu` - Get business menus
- `POST /api/v1/business/:businessId/menu/:menuId` - Update menu
- `DELETE /api/v1/business/:businessId/menu/:menuId` - Delete menu

### User Identities

- `POST /api/v1/user-identities` - Create identity
- `DELETE /api/v1/user-identities/:id` - Delete identity

Full documentation: [docs/API.md](./docs/API.md)

## 🤝 Contributing

### Code Style

- Follow existing patterns (routes → controllers → services)
- Use TypeScript strict mode
- Validate all inputs with Zod
- Handle errors properly (throw typed errors)
- Keep controllers thin (business logic in services)
- Add JSDoc comments for public APIs

### Adding New Endpoints

1. Create Zod schema in `validators/index.ts`
2. Implement service logic in `services/*.service.ts`
3. Create controller in `controllers/*.controller.ts`
4. Define routes in `routes/*.routes.ts`
5. Mount routes in `routes/index.ts`
6. Update API documentation

## 📄 License

Private - Ultimate Street Food Finder

## 🔗 Related Projects

- **Mobile App** - React Native app (`apps/mobile`)
- **Shared Package** - Common types and utilities (`packages/shared`)

---

Built with ❤️ using Node.js, Express, TypeScript, and Supabase

# Ultimate Street Food Finder - API Server

Production-grade RESTful API built with Node.js, Express, TypeScript, and Supabase.

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase account

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run

```bash
pnpm dev
```

API runs at `http://localhost:4000`

### Verify

```bash
curl http://localhost:4000/health
```

For detailed setup: [docs/QUICK_START.md](./docs/QUICK_START.md)

## 📖 Documentation

### Essential Guides

- **[API Endpoints](./docs/API.md)** - All endpoints with examples
- **[Authentication](./docs/AUTH.md)** - Supabase Auth & JWT tokens
- **[Architecture](./docs/ARCHITECTURE.md)** - System design & patterns
- **[Database](./docs/DATABASE.md)** - Schema & data models
- **[Security](./docs/SECURITY.md)** - Security measures & checklist
- **[Setup](./docs/QUICK_START.md)** - Installation & database configuration

### Optional Guides

- **[Testing](./docs/TESTING.md)** - Testing strategies & examples
- **[Deployment](./docs/DEPLOYMENT.md)** - Production deployment

## 🏗️ Architecture

**Layered Design**: Routes → Middleware → Controllers → Services → Database

```
HTTP Request
    ↓
Auth Middleware (verify JWT)
    ↓
Route Handler
    ↓
Controller (parse request)
    ↓
Service (business logic)
    ↓
Supabase (PostgreSQL)
```

### Project Structure

```
src/
├── app.ts                 Express app setup
├── server.ts              Server entry point
├── config/env.ts          Environment & validation
├── controllers/           HTTP handlers
├── services/              Business logic & database
├── routes/                Route definitions
├── middlewares/           Express middleware
├── validators/            Zod schemas
├── utils/                 Helper functions
└── lib/supabase.ts        Supabase client
```

## 🔑 Features

- ✅ **Supabase Auth** - JWT verification, profile management
- ✅ **Business Management** - CRUD with authentication
- ✅ **Menu Management** - Items with multi-image uploads
- ✅ **File Uploads** - Multer + Supabase Storage
- ✅ **Input Validation** - Zod schemas
- ✅ **Error Handling** - Centralized middleware
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Security** - Helmet, CORS, ownership verification

## 🛠️ Scripts

```bash
pnpm dev              # Start dev server
pnpm typecheck        # Type checking
pnpm lint             # Linting
pnpm build            # Production build
pnpm start            # Run production build
```

## 🗄️ Database

### Tables

- `profiles` - User profiles (linked to auth.users)
- `business` - Business/vendor information
- `menu` - Menu items with images

See [docs/DATABASE.md](./docs/DATABASE.md) for complete schema.

### Setup

```sql
-- Run migrations from docs/QUICK_START.md
-- Create storage bucket: menu-images
-- Configure Row Level Security
```

## 🧪 Testing

### Manual Testing

```bash
curl http://localhost:4000/health

# With auth token
TOKEN="your-jwt-here"
curl http://localhost:4000/api/v1/business \
  -H "Authorization: Bearer $TOKEN"
```

See [docs/TESTING.md](./docs/TESTING.md) for comprehensive examples.

## 📋 Endpoints Summary

### Public

- `GET /health` - Health check
- `GET /api/v1/vendors` - Vendor list

### Authenticated

- `POST /api/v1/business` - Create business
- `GET /api/v1/business` - Get my businesses
- `GET /api/v1/business/:id` - Get single business
- `PUT /api/v1/business/:id` - Update business
- `DELETE /api/v1/business/:id` - Delete business
- `POST /api/v1/business/:id/menu` - Create menu
- `GET /api/v1/business/:id/menu` - Get menus
- `POST /api/v1/business/:id/menu/:id` - Update menu
- `DELETE /api/v1/business/:id/menu/:id` - Delete menu

Full docs: [docs/API.md](./docs/API.md)

## 🤝 Contributing

### Code Style

- Follow existing patterns
- Use TypeScript strict mode
- Validate all inputs with Zod
- Throw typed errors
- Keep controllers thin
- Add JSDoc comments

### Adding Features

1. Create Zod schema in `validators/index.ts`
2. Implement service in `services/*.service.ts`
3. Create controller in `controllers/*.controller.ts`
4. Define routes in `routes/*.routes.ts`
5. Update [docs/API.md](./docs/API.md)

## 📚 Resources

- [API Documentation](./docs/API.md)
- [Setup Guide](./docs/QUICK_START.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Security](./docs/SECURITY.md)
- [Testing](./docs/TESTING.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Authentication](./docs/AUTH.md)

---

Built with ❤️ using Node.js, Express, TypeScript, and Supabase

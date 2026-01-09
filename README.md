# Ultimate Street Food Finder 🍜

A monorepo starter with React Native (Expo) mobile app and Node.js Express API.

## 🏗️ Structure

```
ultimate-street-food-finder/
├── apps/
│   ├── mobile/          # React Native Expo app (TypeScript)
│   └── api/             # Node.js Express API (TypeScript)
└── packages/
    └── shared/          # Shared TypeScript types
```

## 🧠 Mental Model for This Monorepo

This project is a **pnpm workspace** containing multiple interconnected packages:

- **Root `package.json`**: The orchestrator. Contains scripts that run commands across the workspace. You run pnpm commands here.
- **`apps/*`**: Runnable applications (mobile app, API server). These depend on shared packages.
- **`packages/*`**: Shared, non-runnable code (types, utilities). Used by apps via internal dependencies.

Think of it like a company:

- Root = Manager who coordinates everyone
- Apps = Different departments that do the actual work
- Packages = Shared resources (HR, IT) that departments use

**Key insight**: All apps share a single `node_modules` at the root (with some symlinks in app folders). This ensures version consistency and saves disk space.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### 🔢 Node Version

This project uses **Node.js 20.19.4**, managed via nvm (Node Version Manager). The required version is defined in the `.nvmrc` file at the repository root.

Using nvm ensures the correct Node version is activated without relying on a globally installed Node version.

**Setup with nvm:**

```bash
# Install the Node version specified in .nvmrc
nvm install

# Activate the correct Node version
nvm use

# Verify the Node version
node -v
# Should output: v20.19.4
```

If you don't have nvm installed, see [nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating).

### Installation

```bash
# Install dependencies (ALWAYS from root)
pnpm install

# Build shared types
cd packages/shared && pnpm build && cd ../..
```

## 📦 pnpm Workspace Fundamentals (Important)

### What is `workspace:*`?

In `apps/mobile/package.json` and `apps/api/package.json`, you'll see:

```json
"@ultimate-sf/shared": "workspace:*"
```

This tells pnpm: "Link to the local `packages/shared` package in this workspace, not from npm registry."

When you run `pnpm install`, pnpm:

1. Installs all dependencies to a shared `node_modules` at the root
2. Creates symlinks so each app can access its dependencies
3. Links local packages (like `@ultimate-sf/shared`) directly

### Why Install from Root?

**✅ Correct**: `pnpm install` from `/the-ultimate-streetfood-finder/`

**❌ Wrong**: `cd apps/mobile && npm install`

Reasons:

- pnpm uses a **centralized node_modules** at the workspace root
- Installing from subdirectories breaks the workspace structure
- Using npm/yarn instead of pnpm creates conflicts and duplicate dependencies

### Understanding node_modules

You might see `node_modules` folders inside `apps/mobile` and `apps/api`. These are **symlinks** to the root-level dependencies, not duplicates. This is normal and expected.

### Golden Rules

- ✅ Always run `pnpm install` from the repository root
- ✅ Always use `pnpm` (never npm or yarn) in this project
- ✅ Install new packages using `pnpm --filter <workspace-name> add <package>`
- ✅ Run scripts from root using `pnpm dev`, `pnpm dev:api`, etc.
- ❌ Never run `npm install` anywhere in this project
- ❌ Never mix package managers (npm, yarn, pnpm)

## ▶️ Running Apps (Step-by-Step)

### Run Both Mobile + API Together

```bash
# 1. Make sure you're in the repository root
cd /path/to/the-ultimate-streetfood-finder

# 2. Start both apps in parallel
pnpm dev
```

This runs the `"dev"` script from the root `package.json`, which executes:

- `pnpm dev:api` (starts Express server on port 4000)
- `pnpm dev:mobile` (starts Expo dev server)

### Run ONLY the Mobile App

```bash
# 1. From repository root
cd /path/to/the-ultimate-streetfood-finder

# 2. Start mobile app
pnpm dev:mobile
```

This executes `expo start` inside `apps/mobile/`. The Expo dev server will open, and you can:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

**Important**: Make sure the API is running separately if your app needs data.

### Run ONLY the API

```bash
# 1. From repository root
cd /path/to/the-ultimate-streetfood-finder

# 2. Start API server
pnpm dev:api
```

This executes `tsx watch src/server.ts` inside `apps/api/`, starting the Express server on `http://localhost:4000`.

Test it works:

```bash
curl http://localhost:4000/health
```

## 📱 Mobile App Configuration

The mobile app needs to know where to find the API server. Create `apps/mobile/.env`:

### iOS Simulator

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000
```

### Android Emulator

````bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```➕ Installing Dependencies (Correct Way)

**Always run these commands from the repository root.**

### Add to Mobile App

```bash
# Production dependency (e.g., axios for API calls)
pnpm --filter @ultimate-sf/mobile add axios

# Dev dependency (e.g., TypeScript types)
pnpm --filter @ultimate-sf/mobile add -D @types/react
````

The `--filter` flag targets the specific workspace. This updates `apps/mobile/package.json`.

### Add to API

```bash
# Production dependency (e.g., cors middleware)
pnpm --filter @ultimate-sf/api add cors

# Dev dependency (e.g., types)
pnpm --filter @ultimate-sf/api add -D @types/cors
```

### Add to Shared Package

```bash
# Production dependency (e.g., zod for validation schemas)
pnpm --filter @ultimate-sf/shared add zod

# Dev dependency
pnpm --filter @ultimate-sf/shared add -D @types/node
```

### Add to Workspace Root (Build Tools, Linters)

For tools that manage the entire workspace (e.g., Prettier, ESLint, TypeScript):

```bash
# -D for dev dependency, -w for workspace root
pnpm add -Dw prettier
pnpm add -Dw eslint
pnpm add -Dw typescript
```

### Finding Workspace Names

Workspace names are in each `package.json`:

- `@ultimate-sf/mobile` → `apps/mobile/package.json`
- `@ultimate-sf/api` → `apps/api/package.json`
- `@ultimate-sf/shared` → `packages/shared/package.json`

### Examples

````bash
# Add zod to shared types package
pnpm --filter @ultimate-sf/shared add zod

# Add react-native-maps to mobile app
pnpm --filter @ultimate-sf/mobile add react-native-maps

# Add express-validator to API
pnpm --filter @ultimate-sf/api add express-validator

# Add prettier to root (for whole workspace)
pnpm add -Dw prettierfig | grep "inet " | grep -v 127.0.0.1`
> - **Windows**: `ipconfig` (look for IPv4 Address)

**Important**: Your phone and computer must be on the same WiFi network!

## 🔧 API Endpoints

- `GET /health` - Health check
- `GET /api/v1/vendors` - List all vendors
- `GET /api/v1/vendors/:id` - Get vendor by ID


## ❌ Common pnpm Mistakes to Avoid

### Mistake 1: Using npm or yarn

```bash
# ❌ WRONG
cd apps/mobile
npm install

# ✅ CORRECT
cd /path/to/repo-root
pnpm install
````

**Why it's wrong**: npm creates a separate `node_modules` and `package-lock.json`, breaking the pnpm workspace structure.

### Mistake 2: Installing from Inside App Folders

```bash
# ❌ WRONG
cd apps/api
pnpm install

# ✅ CORRECT
cd /path/to/repo-root
pnpm install
```

**Why it's wrong**: pnpm workspaces are designed to be managed from the root. Installing from subdirectories can cause dependency resolution issues.

### Mistake 3: Adding Dependencies Without --filter

```bash
# ❌ WRONG (adds to root package.json)
pnpm add axios

# ✅ CORRECT (adds to mobile app)
pnpm --filter @ultimate-sf/mobile add axios
```

### Mistake 4: Mixing Package Managers

Having both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm) in your repo.

**Fix**: Delete `package-lock.json` and `yarn.lock` if they exist. Only commit `pnpm-lock.yaml`.

### Mistake 5: Committing Wrong Lock Files

```bash
# ❌ WRONG - never commit these
package-lock.json
yarn.lock

# ✅ CORRECT - only commit this
pnpm-lock.yaml
```

### Recovery: If Someone Used npm or yarn

If someone accidentally ran `npm install` or `yarn install`:

```bash
# 1. Remove all node_modules and lock files
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -f package-lock.json yarn.lock apps/*/package-lock.json

# 2. Clean pnpm cache (optional but recommended)
pnpm store prune

# 3. Fresh install with pnpm
pnpm install

# 4. Rebuild shared packages
cd packages/shared && pnpm build && cd ../..
```

### Recovery: Dependency Hell

If things are completely broken:

```bash
# Nuclear option - full clean
pnpm clean          # runs clean scripts in all packages
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -f pnpm-lock.yaml

# Fresh start
pnpm install
cd packages/shared && pnpm build && cd ../..
```

## 🛠️ Tech Stack

### Mobile (`apps/mobile`)

- Expo (React Native)
- Expo Router (file-based routing)
- TypeScript

### API (`apps/api`)

- Express
- TypeScript
- CORS enabled

### Shared (`packages/shared`)

- TypeScript type definitions

## 📂 Mobile Structure (meals-to-go conventions)

```
apps/mobile/src/
├── app/              # Expo Router screens
├── components/       # Reusable components
├── services/         # API client & service calls
└── theme/            # Colors, spacing, etc.
```

## 🐛 Troubleshooting

### Mobile app can't connect to API

1. Check API is running: `curl http://localhost:4000/health`
2. Verify `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`
3. For physical device, ensure same WiFi network and correct LAN IP
4. Check firewall settings (allow port 4000)

### Port 4000 already in use

```bash
lsof -ti:4000 | xargs kill -9
```

### Clear and reinstall

```bash
pnpm clean
pnpm install
cd packages/shared && pnpm build
```

## 📄 Environment Variables

Copy `.env.example` to create your environment files:

```bash
# API
cp .env.example apps/api/.env

# Mobile
cp .env.example apps/mobile/.env
# Then edit apps/mobile/.env with your API URL
```

## 📦 Adding Dependencies

```bash
# To API
pnpm --filter @ultimate-sf/api add package-name

# To Mobile
pnpm --filter @ultimate-sf/mobile add package-name

# To root (dev tools)
pnpm add -Dw package-name
```

## 📄 License

MIT

# Deployment Guide

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline                         │
│  (GitHub Actions / GitLab CI / Vercel)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌─────────┐
    │  Test  │  │ Build  │  │ Lint    │
    └────────┘  └────────┘  └─────────┘
         │           │           │
         └───────────┼───────────┘
                     ▼
         ┌───────────────────────┐
         │  Container Registry   │
         │  (Docker Hub / ECR)   │
         └───────────┬───────────┘
                     ▼
    ┌────────────────────────────────┐
    │   Staging Environment          │
    │   (docker compose locally)      │
    └────────────────────────────────┘
                     ▼
    ┌────────────────────────────────┐
    │   Production Environment       │
    │   (Railway / Vercel / AWS)      │
    └────────────────────────────────┘
```

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] No console.log statements left
- [ ] No TODO/FIXME comments
- [ ] Code review completed

### Security

- [ ] No hardcoded secrets or passwords
- [ ] All environment variables documented
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation complete
- [ ] Authentication working
- [ ] Authorization checks in place

### Documentation

- [ ] README updated with latest info
- [ ] API documentation current
- [ ] Architecture documentation updated
- [ ] Deployment instructions accurate
- [ ] Environment variables documented
- [ ] Breaking changes documented

### Database

- [ ] All migrations tested locally
- [ ] Backup plan documented
- [ ] Rollback plan documented
- [ ] Schema changes backward compatible
- [ ] Indexes added for performance
- [ ] RLS policies configured

## Local Testing Before Deployment

### 1. Build Docker Image

```bash
# From project root
docker build -f apps/api/Dockerfile -t streetfood-api:test .

# Test the image locally
docker run -p 4000:4000 \
  -e SUPABASE_URL="your-test-url" \
  -e SUPABASE_ANON_KEY="your-test-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-test-role" \
  -e ENVIRONMENT="test" \
  streetfood-api:test
```

### 2. Run Integration Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test business.service

# Run with coverage
pnpm test --coverage

# Run integration tests only
pnpm test:integration
```

### 3. Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run apps/api/k6-test.js

# Monitor performance during test
watch -n 0.1 'docker stats'
```

### 4. Environment Variable Validation

```bash
# Check all required vars are set
cat apps/api/.env | grep -v "^#" | grep -v "^$"

# Verify format
# Should have: KEY=VALUE format
```

## Deployment Methods

### Option 1: Railway.app (Recommended for Beginners)

Railway handles containers, databases, and deployments automatically.

#### Setup

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Click "Deploy"
5. Configure environment variables in Dashboard

#### Environment Variables (in Railway Dashboard)

```
SUPABASE_URL=https://livjafablrkxszdfrsrb.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
ENVIRONMENT=production
PORT=4000
```

#### Monitoring

- View logs: Dashboard → "Logs"
- View metrics: Dashboard → "Metrics"
- Set up alerts: Dashboard → "Alerts"

### Option 2: Vercel

Vercel specializes in Node.js deployments with zero-config experience.

#### Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel deploy`

#### Configuration (vercel.json)

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "env": ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
}
```

### Option 3: AWS EC2 + ECS

For more control and scalability.

#### Setup Steps

1. Create ECR repository
2. Build and push Docker image
3. Create ECS cluster
4. Create ECS service
5. Configure load balancer
6. Set up auto-scaling

#### Docker Build & Push

```bash
# Build image
docker build -f apps/api/Dockerfile -t streetfood-api:latest .

# Tag for ECR
docker tag streetfood-api:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/streetfood-api:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

# Push
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/streetfood-api:latest
```

### Option 4: Docker Compose (Self-Hosted)

For complete control on your own server.

#### Docker Compose Setup

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      NODE_ENV: production
      ENVIRONMENT: production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      - postgres
    networks:
      - streetfood

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - streetfood
    restart: unless-stopped

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - streetfood
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  streetfood:
    driver: bridge
```

#### Deploy Steps

```bash
# Copy to server
scp -r . user@server:/app

# SSH into server
ssh user@server

# Go to directory
cd /app

# Create .env file
cat > .env <<EOF
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-role-key
DB_USER=postgres
DB_PASSWORD=secure-password
DB_NAME=streetfood
EOF

# Start services
docker compose up -d

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

## CI/CD Pipeline Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy API

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build

      - name: Deploy to Railway
        uses: railwayapp/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          service: api

      - name: Notify deployment
        if: success()
        run: |
          echo "Deployment successful!"
          echo "API available at: https://api.streetfood.app"
```

## Post-Deployment

### Immediate Checks (First 30 minutes)

1. Health check endpoint responds: `curl https://api.yourdomain.com/health`
2. Public endpoints work: `curl https://api.yourdomain.com/api/v1/vendors`
3. Check logs for errors
4. Monitor error rate (should be < 0.1%)
5. Monitor response times
6. Verify database connections

### Ongoing Monitoring

#### Metrics to Track

- API response time (p50, p95, p99)
- Error rate (5xx, 4xx, validation errors)
- Request count per endpoint
- Database query performance
- Active connections
- CPU and memory usage
- Disk space

#### Tools

- **Application**: Datadog, New Relic, LogRocket
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack, CloudWatch
- **Alerts**: PagerDuty, Slack, Email

#### Example Slack Alert

```bash
# In error handler, send to Slack
async function sendAlert(error: Error) {
  const message = {
    text: `🚨 API Error in Production`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Environment*: Production\n*Error*: ${error.message}\n*Time*: ${new Date().toISOString()}`
        }
      }
    ]
  };

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(message)
  });
}
```

### Rollback Strategy

If deployment causes critical issues:

```bash
# Option 1: Revert to previous container
docker pull streetfood-api:previous
docker run -d streetfood-api:previous

# Option 2: Revert code and redeploy
git revert <commit-hash>
git push

# Option 3: From Railway dashboard
# Deployments → Select previous version → Rollback

# Option 4: Docker Compose
docker compose down
docker compose up -d  # Uses previous image
```

### Database Rollback

```sql
-- If migrations went wrong, rollback:
BEGIN;
  -- Undo changes
  DROP TABLE IF EXISTS new_table;
  ALTER TABLE old_table RENAME TO correct_name;
COMMIT;

-- Or use Supabase dashboard:
-- Database → Migrations → Revert last migration
```

## Performance Optimization Post-Deployment

### Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_business_user_id ON business(user_id);
CREATE INDEX idx_menu_business_id ON menu(business_id);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM business WHERE user_id = '...';

-- Enable connection pooling
-- (Supabase does this by default)
```

### API Optimization

```typescript
// Implement caching
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.get("/api/v1/vendors", (req, res) => {
  const cached = cache.get("vendors");
  if (cached) return res.json(cached);

  // ... fetch from DB ...
  cache.set("vendors", data);
  res.json(data);
});

// Implement pagination
app.get("/api/v1/vendors", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const offset = (page - 1) * limit;

  // ... SELECT ... LIMIT limit OFFSET offset
});
```

### Static Asset Optimization

```typescript
// Serve images from CDN instead of API
// Use Supabase Storage with CDN:
const imageUrl = supabase.storage.from("menu-images").getPublicUrl("image.jpg")
  .data.publicUrl;

// CDN automatically caches and serves from edge
```

## Scaling

### Vertical Scaling (Bigger Server)

- Upgrade server resources (CPU, RAM)
- Simple but has limits

### Horizontal Scaling (More Servers)

```yaml
# Load balancer distributes traffic
┌─────────────┐
│  Load       │
│ Balancer    │
└──────┬──────┘
│
┌───┼───┬────────┐
▼   ▼   ▼        ▼
┌────┐┌───┐┌───┐  ┌───┐
│API1││API2││API3│ │API4│
└────┘└───┘└───┘  └───┘
│     │
└─────┴─── Shared Database (Supabase)
```

#### With Docker Compose

```yaml
version: "3.8"
services:
  nginx:
    # ... load balancer config

  api:
    # ... api config
    deploy:
      replicas: 3 # Run 3 instances
```

#### With Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: streetfood-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    # ... pod template
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
    - port: 4000
```

## Monitoring & Alerts

### Critical Alerts

- **5xx Errors**: Alert if > 1% of requests
- **High Latency**: Alert if p95 > 1000ms
- **Database**: Alert if query > 5s
- **Memory**: Alert if > 80% usage
- **Downtime**: Alert immediately

### Logging

```typescript
// Add request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// Structure logs for analysis
const logger = {
  info: (msg: string, meta?: object) =>
    console.log(JSON.stringify({ level: "info", msg, ...meta })),
  error: (msg: string, error?: Error) =>
    console.log(JSON.stringify({ level: "error", msg, error: error?.message })),
};

// Use in code
logger.error("Failed to create business", error);
```

## Troubleshooting

### API won't start

```bash
# Check logs
docker logs container-name

# Check environment variables
docker exec container-name env | grep SUPABASE

# Test database connection
docker exec container-name node -e "
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  client.auth.getSession().then(console.log);
"
```

### High memory usage

```bash
# Check for memory leaks
docker stats

# Profile with clinic
npm install -g clinic
clinic doctor -- node dist/server.js
```

### Database connection errors

```sql
-- Check connections
SELECT * FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - interval '10 minutes';
```

### Response time degradation

```sql
-- Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

-- Add indexes for slow queries
CREATE INDEX idx_name ON table(column);
```

## References

- [Railway Deployment Docs](https://docs.railway.app)
- [Vercel Node.js](https://vercel.com/docs/runtimes/nodejs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- [Supabase Deployment Docs](https://supabase.com/docs)

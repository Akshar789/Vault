# Deployment Guide - Fly.io + Supabase

## Prerequisites

- [Fly.io account](https://fly.io/app/sign-up)
- [Supabase account](https://supabase.com)
- [Upstash Redis account](https://upstash.com)
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Node.js 20+ installed locally

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Fly.io Edge Network                       │
│                    (TLS 1.3, DDoS protection)               │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Backend     │ │  Backend     │ │  Backend     │
│  Instance 1  │ │  Instance 2  │ │  Instance 3  │
│  (Stateless) │ │  (Stateless) │ │  (Stateless) │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Supabase    │ │  Upstash     │ │  Frontend    │
│  PostgreSQL  │ │  Redis       │ │  (Vercel)    │
│  (Encrypted) │ │  (TLS)       │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

```bash
# Go to https://app.supabase.com
# Click "New Project"
# Choose organization and region
# Set strong database password
# Wait for project to be ready (~2 minutes)
```

### 1.2 Get Database Credentials

```bash
# Go to Project Settings > Database
# Copy "Connection string" (URI format)
# Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 1.3 Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Run migrations
supabase db push

# Or manually via SQL Editor in Supabase dashboard
# Copy contents of supabase/migrations/001_initial_schema.sql
# Paste into SQL Editor and run
```

### 1.4 Verify Schema

```sql
-- In Supabase SQL Editor, verify tables created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see:
-- users
-- device_sessions
-- vault_items
-- organizations
-- organization_members
-- collections
-- audit_logs
-- revoked_tokens
```

### 1.5 Configure Connection Pooling

```bash
# Supabase provides connection pooling by default
# Use "Transaction" mode for best performance
# Connection string format:
# postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

## Step 2: Upstash Redis Setup

### 2.1 Create Redis Database

```bash
# Go to https://console.upstash.com
# Click "Create Database"
# Choose region (same as Fly.io for low latency)
# Select "TLS enabled"
# Click "Create"
```

### 2.2 Get Redis URL

```bash
# Copy "Redis URL" from database details
# Format: rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379
```

## Step 3: Fly.io Backend Deployment

### 3.1 Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Verify installation
flyctl version
```

### 3.2 Login to Fly.io

```bash
flyctl auth login
```

### 3.3 Create Fly.io App

```bash
cd apps/backend

# Create app (choose unique name)
flyctl apps create your-vault-backend

# Or let Fly generate name
flyctl apps create
```

### 3.4 Configure Secrets

```bash
# Set environment variables as secrets
flyctl secrets set \
  NODE_ENV=production \
  DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379" \
  JWT_SECRET="$(openssl rand -base64 64)" \
  JWT_REFRESH_SECRET="$(openssl rand -base64 64)" \
  CORS_ORIGINS="https://yourdomain.com" \
  --app your-vault-backend

# Verify secrets set
flyctl secrets list --app your-vault-backend
```

### 3.5 Configure fly.toml

Create `apps/backend/fly.toml`:

```toml
app = "your-vault-backend"
primary_region = "iad" # Choose region close to Supabase

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"
  
  # Argon2 parameters (tunable)
  ARGON2_MEMORY = "65536"
  ARGON2_TIME = "3"
  ARGON2_PARALLELISM = "4"
  
  # Rate limiting
  RATE_LIMIT_MAX = "100"
  RATE_LIMIT_WINDOW_MS = "900000"
  LOGIN_RATE_LIMIT_MAX = "5"
  
  # Security
  MAX_FAILED_LOGIN_ATTEMPTS = "5"
  ACCOUNT_LOCKOUT_DURATION_MS = "900000"
  MAX_DEVICES_PER_USER = "10"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

  [http_service.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[metrics]
  port = 9091
  path = "/metrics"

[[services]]
  protocol = "tcp"
  internal_port = 8080

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

# Auto-scaling
[scaling]
  min_machines = 1
  max_machines = 10

# Regions for multi-region deployment
[regions]
  iad = true  # US East
  # lhr = true  # London (uncomment for EU)
  # syd = true  # Sydney (uncomment for APAC)
```

### 3.6 Create Dockerfile

Create `apps/backend/Dockerfile`:

```dockerfile
# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=@vault/backend --workspace=@vault/shared

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

# Build
RUN npm run build --workspace=@vault/shared
RUN npm run build --workspace=@vault/backend

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM node:20-alpine

# Install production dependencies only
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/backend/package*.json ./apps/backend/
COPY --from=builder /app/packages/shared/package*.json ./packages/shared/

# Install production dependencies
RUN npm ci --workspace=@vault/backend --workspace=@vault/shared --only=production

# Copy built files
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "apps/backend/dist/main.js"]
```

### 3.7 Deploy to Fly.io

```bash
# Deploy
flyctl deploy --app your-vault-backend

# Monitor deployment
flyctl logs --app your-vault-backend

# Check status
flyctl status --app your-vault-backend

# Open in browser
flyctl open --app your-vault-backend
```

### 3.8 Scale Application

```bash
# Scale to 3 instances
flyctl scale count 3 --app your-vault-backend

# Scale memory
flyctl scale memory 1024 --app your-vault-backend

# Scale CPU
flyctl scale vm shared-cpu-2x --app your-vault-backend

# Auto-scaling (edit fly.toml)
[scaling]
  min_machines = 2
  max_machines = 10
```

### 3.9 Multi-Region Deployment

```bash
# Add regions
flyctl regions add lhr syd --app your-vault-backend

# Remove regions
flyctl regions remove lhr --app your-vault-backend

# List regions
flyctl regions list --app your-vault-backend

# Backup region (read replicas)
flyctl regions backup lhr --app your-vault-backend
```

## Step 4: Frontend Deployment (Vercel)

### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Configure Environment Variables

Create `apps/frontend/.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-vault-backend.fly.dev
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4.3 Deploy to Vercel

```bash
cd apps/frontend

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_APP_URL production
```

## Step 5: Custom Domain Setup

### 5.1 Backend Domain (Fly.io)

```bash
# Add certificate
flyctl certs add api.yourdomain.com --app your-vault-backend

# Check certificate status
flyctl certs show api.yourdomain.com --app your-vault-backend

# Add DNS records (in your DNS provider):
# A record: api.yourdomain.com -> [Fly.io IP from certs show]
# AAAA record: api.yourdomain.com -> [Fly.io IPv6 from certs show]
```

### 5.2 Frontend Domain (Vercel)

```bash
# In Vercel dashboard:
# Settings > Domains > Add Domain
# Follow DNS configuration instructions
```

### 5.3 Update CORS Origins

```bash
flyctl secrets set \
  CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com" \
  --app your-vault-backend
```

## Step 6: Monitoring & Logging

### 6.1 Fly.io Monitoring

```bash
# View logs
flyctl logs --app your-vault-backend

# Real-time logs
flyctl logs -f --app your-vault-backend

# Metrics
flyctl dashboard metrics --app your-vault-backend

# SSH into instance
flyctl ssh console --app your-vault-backend
```

### 6.2 Supabase Monitoring

```bash
# In Supabase dashboard:
# Database > Query Performance
# Monitor slow queries, connection pool usage
```

### 6.3 Upstash Monitoring

```bash
# In Upstash console:
# Monitor memory usage, command stats, latency
```

### 6.4 Set Up Alerts

```bash
# Fly.io alerts (via dashboard or API)
# - High CPU usage (>80%)
# - High memory usage (>80%)
# - Error rate (>1%)
# - Response time (>1s)

# Supabase alerts
# - Connection pool exhaustion
# - Slow queries (>100ms)
# - Disk usage (>80%)
```

## Step 7: Backup & Disaster Recovery

### 7.1 Database Backups

```bash
# Supabase provides automatic daily backups
# Retention: 7 days (free tier), 30 days (pro tier)

# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Encrypt backup
gpg --encrypt --recipient your@email.com backup.sql

# Upload to S3/R2
aws s3 cp backup.sql.gpg s3://your-backup-bucket/
```

### 7.2 Restore from Backup

```bash
# Download backup
aws s3 cp s3://your-backup-bucket/backup.sql.gpg .

# Decrypt
gpg --decrypt backup.sql.gpg > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### 7.3 Disaster Recovery Plan

```
RTO (Recovery Time Objective): 1 hour
RPO (Recovery Point Objective): 24 hours

Steps:
1. Detect outage (monitoring alerts)
2. Assess impact (which services affected)
3. Switch to backup region (if multi-region)
4. Restore database from backup (if needed)
5. Redeploy application (if needed)
6. Verify functionality
7. Communicate with users
8. Post-mortem analysis
```

## Step 8: Security Hardening

### 8.1 Enable Security Headers

Already configured in `apps/backend/src/main.ts`:
- Strict-Transport-Security
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Content-Security-Policy

### 8.2 Rate Limiting

Configured via environment variables:
- Global: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour

### 8.3 DDoS Protection

Fly.io provides built-in DDoS protection:
- Automatic mitigation
- Rate limiting at edge
- Geographic filtering (optional)

### 8.4 Secrets Rotation

```bash
# Rotate JWT secrets every 90 days
flyctl secrets set \
  JWT_SECRET="$(openssl rand -base64 64)" \
  JWT_REFRESH_SECRET="$(openssl rand -base64 64)" \
  --app your-vault-backend

# This will force all users to re-login
```

## Step 9: Performance Optimization

### 9.1 Database Optimization

```sql
-- Create indexes (already in migration)
-- Monitor slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Vacuum regularly
VACUUM ANALYZE;

-- Update statistics
ANALYZE;
```

### 9.2 Redis Optimization

```bash
# Set maxmemory policy
# In Upstash console: Settings > Configuration
# Set: maxmemory-policy allkeys-lru
```

### 9.3 Application Optimization

```bash
# Enable compression
# Already configured in NestJS

# Connection pooling
# Already configured (10 connections)

# Caching
# Redis caching for frequently accessed data
```

## Step 10: Maintenance

### 10.1 Regular Tasks

**Daily**:
- Check error logs
- Monitor resource usage
- Verify backups completed

**Weekly**:
- Review audit logs
- Check for security updates
- Monitor slow queries

**Monthly**:
- Update dependencies
- Review access logs
- Analyze usage patterns

**Quarterly**:
- Rotate JWT secrets
- Security audit
- Performance review

### 10.2 Update Procedure

```bash
# 1. Test locally
npm test

# 2. Deploy to staging
flyctl deploy --app your-vault-backend-staging

# 3. Run smoke tests
curl https://your-vault-backend-staging.fly.dev/health

# 4. Deploy to production
flyctl deploy --app your-vault-backend

# 5. Monitor for errors
flyctl logs -f --app your-vault-backend

# 6. Rollback if needed
flyctl releases list --app your-vault-backend
flyctl releases rollback [VERSION] --app your-vault-backend
```

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Check connection string
flyctl secrets list --app your-vault-backend

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Supabase status
# https://status.supabase.com
```

### Issue: Redis Connection Failed

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check Upstash status
# https://status.upstash.com
```

### Issue: High Memory Usage

```bash
# Check memory usage
flyctl status --app your-vault-backend

# Scale memory
flyctl scale memory 1024 --app your-vault-backend

# Check for memory leaks
flyctl ssh console --app your-vault-backend
node --inspect dist/main.js
```

### Issue: Slow Response Times

```bash
# Check database queries
# In Supabase: Database > Query Performance

# Check Redis latency
# In Upstash: Metrics > Latency

# Add more instances
flyctl scale count 3 --app your-vault-backend
```

## Cost Estimation

### Fly.io (Backend)
- 1 instance (512MB): $5/month
- 3 instances (512MB): $15/month
- 3 instances (1GB): $30/month

### Supabase (Database)
- Free tier: $0/month (500MB database, 2GB bandwidth)
- Pro tier: $25/month (8GB database, 50GB bandwidth)

### Upstash (Redis)
- Free tier: $0/month (10,000 commands/day)
- Pay-as-you-go: $0.20 per 100K commands

### Vercel (Frontend)
- Hobby: $0/month
- Pro: $20/month

**Total (Production)**:
- Small: ~$30/month (1 backend instance, Supabase free, Upstash free)
- Medium: ~$60/month (3 backend instances, Supabase pro, Upstash paid)
- Large: ~$100/month (5 backend instances, Supabase pro, Upstash paid)

## Support

- Fly.io: https://community.fly.io
- Supabase: https://supabase.com/support
- Upstash: https://upstash.com/docs

## Conclusion

Your zero-knowledge vault is now deployed on production infrastructure with:
- ✅ Horizontal scaling (Fly.io)
- ✅ Encrypted database (Supabase)
- ✅ Fast caching (Upstash Redis)
- ✅ TLS 1.3 encryption
- ✅ DDoS protection
- ✅ Automatic backups
- ✅ Multi-region support
- ✅ Health checks
- ✅ Monitoring & alerts

**Your users' data is secure even if the entire infrastructure is compromised.**

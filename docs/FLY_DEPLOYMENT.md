# Fly.io Deployment Guide

## Quick Start

This guide will help you deploy your Zero-Knowledge Vault backend to Fly.io in under 10 minutes.

## Prerequisites

1. **Fly.io account** - Sign up at https://fly.io/app/sign-up
2. **Fly CLI installed** - Install from https://fly.io/docs/hands-on/install-flyctl/
3. **Supabase database** - Get connection string from https://supabase.com
4. **Upstash Redis** - Get Redis URL from https://upstash.com

## Step 1: Install Fly CLI

### Windows
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### macOS
```bash
brew install flyctl
```

### Linux
```bash
curl -L https://fly.io/install.sh | sh
```

Verify installation:
```bash
flyctl version
```

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser for authentication.

## Step 3: Create Fly.io App

Navigate to the backend directory:
```bash
cd apps/backend
```

Create a new Fly.io app:
```bash
flyctl apps create vault-backend
```

Or let Fly generate a unique name:
```bash
flyctl apps create
```

## Step 4: Set Environment Secrets

Set all required environment variables as secrets:

```bash
flyctl secrets set \
  NODE_ENV=production \
  DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379" \
  JWT_SECRET="$(openssl rand -base64 64)" \
  JWT_REFRESH_SECRET="$(openssl rand -base64 64)" \
  CORS_ORIGINS="https://yourdomain.com" \
  --app vault-backend
```

**Important**: Replace the placeholders:
- `[PASSWORD]` - Your Supabase database password
- `[PROJECT-REF]` - Your Supabase project reference
- `[ENDPOINT]` - Your Upstash Redis endpoint
- `yourdomain.com` - Your frontend domain

Verify secrets are set:
```bash
flyctl secrets list --app vault-backend
```

## Step 5: Configure fly.toml

The `fly.toml` file is already configured. Update the app name if needed:

```toml
app = "vault-backend"  # Change to your app name
primary_region = "iad"  # Change to your preferred region
```

Available regions:
- `iad` - US East (Virginia)
- `lax` - US West (Los Angeles)
- `lhr` - London
- `fra` - Frankfurt
- `syd` - Sydney
- `sin` - Singapore

## Step 6: Deploy to Fly.io

Deploy your application:
```bash
flyctl deploy --app vault-backend
```

This will:
1. Build the Docker image
2. Push to Fly.io registry
3. Deploy to your app
4. Run health checks

Monitor the deployment:
```bash
flyctl logs --app vault-backend
```

## Step 7: Verify Deployment

Check app status:
```bash
flyctl status --app vault-backend
```

Test health endpoint:
```bash
curl https://vault-backend.fly.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "redis": "connected"
}
```

## Step 8: Scale Application (Optional)

Scale to multiple instances:
```bash
flyctl scale count 3 --app vault-backend
```

Scale memory:
```bash
flyctl scale memory 1024 --app vault-backend
```

Scale CPU:
```bash
flyctl scale vm shared-cpu-2x --app vault-backend
```

## Step 9: Custom Domain (Optional)

Add your custom domain:
```bash
flyctl certs add api.yourdomain.com --app vault-backend
```

Check certificate status:
```bash
flyctl certs show api.yourdomain.com --app vault-backend
```

Add DNS records (in your DNS provider):
```
A record: api.yourdomain.com -> [Fly.io IP from certs show]
AAAA record: api.yourdomain.com -> [Fly.io IPv6 from certs show]
```

Update CORS origins:
```bash
flyctl secrets set CORS_ORIGINS="https://yourdomain.com,https://api.yourdomain.com" --app vault-backend
```

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs
flyctl logs -f --app vault-backend

# Last 100 lines
flyctl logs --app vault-backend
```

### SSH into Instance
```bash
flyctl ssh console --app vault-backend
```

### View Metrics
```bash
flyctl dashboard metrics --app vault-backend
```

### Restart Application
```bash
flyctl apps restart vault-backend
```

### Update Application
```bash
# Make code changes, then:
flyctl deploy --app vault-backend
```

### Rollback Deployment
```bash
# List releases
flyctl releases list --app vault-backend

# Rollback to previous version
flyctl releases rollback [VERSION] --app vault-backend
```

## Troubleshooting

### Issue: Build Failed

Check build logs:
```bash
flyctl logs --app vault-backend
```

Common causes:
- Missing dependencies in package.json
- TypeScript compilation errors
- Docker build issues

### Issue: Health Check Failed

Check if app is running:
```bash
flyctl status --app vault-backend
```

SSH into instance:
```bash
flyctl ssh console --app vault-backend
```

Check logs:
```bash
flyctl logs --app vault-backend
```

### Issue: Database Connection Failed

Verify DATABASE_URL secret:
```bash
flyctl secrets list --app vault-backend
```

Test connection from instance:
```bash
flyctl ssh console --app vault-backend
# Inside instance:
node -e "const pg = require('pg'); const client = new pg.Client(process.env.DATABASE_URL); client.connect().then(() => console.log('Connected')).catch(console.error)"
```

### Issue: Redis Connection Failed

Verify REDIS_URL secret:
```bash
flyctl secrets list --app vault-backend
```

Test Redis connection:
```bash
flyctl ssh console --app vault-backend
# Inside instance:
node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log).catch(console.error)"
```

## Cost Estimation

### Free Tier
- 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer
- **Cost: $0/month**

### Production (Small)
- 1 shared-cpu-1x VM with 512MB RAM
- **Cost: ~$5/month**

### Production (Medium)
- 3 shared-cpu-1x VMs with 512MB RAM
- **Cost: ~$15/month**

### Production (Large)
- 3 shared-cpu-2x VMs with 1GB RAM
- **Cost: ~$30/month**

## Security Best Practices

1. **Rotate secrets regularly**:
   ```bash
   flyctl secrets set JWT_SECRET="$(openssl rand -base64 64)" --app vault-backend
   ```

2. **Enable automatic HTTPS**:
   Already configured in fly.toml with `force_https = true`

3. **Use private networking** (for multi-app setup):
   ```bash
   flyctl ips private --app vault-backend
   ```

4. **Monitor logs for suspicious activity**:
   ```bash
   flyctl logs -f --app vault-backend | grep "Failed login"
   ```

## Multi-Region Deployment

Deploy to multiple regions for low latency worldwide:

```bash
# Add regions
flyctl regions add lhr syd --app vault-backend

# List regions
flyctl regions list --app vault-backend

# Remove regions
flyctl regions remove lhr --app vault-backend
```

## Backup & Recovery

### Database Backups
Supabase provides automatic daily backups. For manual backups:

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Application Rollback
```bash
# List releases
flyctl releases list --app vault-backend

# Rollback
flyctl releases rollback [VERSION] --app vault-backend
```

## Next Steps

1. **Set up monitoring** - Configure alerts for errors and downtime
2. **Configure CI/CD** - Automate deployments with GitHub Actions
3. **Add custom domain** - Use your own domain instead of fly.dev
4. **Scale horizontally** - Add more instances for high availability
5. **Deploy frontend** - Deploy Next.js frontend to Vercel

## Support

- Fly.io Docs: https://fly.io/docs
- Fly.io Community: https://community.fly.io
- GitHub Issues: https://github.com/Akshar789/Vault/issues

## Conclusion

Your Zero-Knowledge Vault backend is now deployed on Fly.io with:
- ✅ Automatic HTTPS
- ✅ Health checks
- ✅ Auto-scaling
- ✅ Multi-region support
- ✅ Zero-downtime deployments

**Your users' data remains secure even if the server is compromised.**

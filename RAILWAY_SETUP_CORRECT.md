# ✅ Correct Railway Setup for Monorepo

## The Problem

Railway is trying to build from `apps/backend` directory, but it's a monorepo that needs to build from the root.

---

## 🎯 CORRECT Configuration

### Step 1: Update Railway Settings

In your Railway dashboard, go to **Settings**:

1. **Root Directory**: 
   - **LEAVE EMPTY** or set to `/`
   - ❌ DO NOT set to `apps/backend`

2. **Custom Build Command**: 
   - **LEAVE EMPTY** (let nixpacks handle it)

3. **Custom Start Command**:
   - **LEAVE EMPTY** (let nixpacks handle it)

4. **Watch Paths**:
   - Add: `apps/backend/**`
   - Add: `packages/shared/**`

### Step 2: Verify Environment Variables

Make sure ALL these are set in Railway Variables tab:

```
DATABASE_URL=postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres

DIRECT_URL=postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres

SUPABASE_URL=https://zkmolpbnqdgsvsulyzec.supabase.co

SUPABASE_ANON_KEY=sb_publishable_DnG9gbdp_jQFVHRtwdrsBQ_iN0wZX-5

SUPABASE_SERVICE_ROLE_KEY=sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD

REDIS_URL=rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379

JWT_SECRET=K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC

JWT_REFRESH_SECRET=X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG

NODE_ENV=production

PORT=8080

CORS_ORIGINS=https://vault-vert-eight.vercel.app,http://localhost:3002

JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_EXPIRES_IN=7d
```

### Step 3: Trigger Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"**
3. Wait 5-7 minutes for build

---

## 🔍 What the nixpacks.toml Does

The `nixpacks.toml` file I created tells Railway:

1. **Install phase**: Run `npm ci` from root
2. **Build phase**: 
   - Build shared package first: `npm run build --workspace=packages/shared`
   - Build backend: `npm run build --workspace=apps/backend`
3. **Start phase**: Run `node apps/backend/dist/main.js`

This handles the monorepo structure correctly!

---

## ✅ Expected Build Output

You should see in the logs:

```
[nixpacks] Installing dependencies...
[nixpacks] Running: npm ci
[nixpacks] Building packages...
[nixpacks] Running: npm run build --workspace=packages/shared
[nixpacks] Running: npm run build --workspace=apps/backend
[nixpacks] Starting application...
[nixpacks] Running: node apps/backend/dist/main.js
[Nest] Application successfully started
```

---

## 🆘 If It Still Fails

### Check 1: Verify nixpacks.toml is in the repo

The file should be at: `apps/backend/nixpacks.toml`

If Railway doesn't see it, it will use default build commands which won't work.

### Check 2: Look for specific errors

Common errors:

**"Cannot find module '@vault/shared'"**
- Fix: Make sure shared package builds first
- The nixpacks.toml handles this

**"ENOENT: no such file or directory"**
- Fix: Root directory is wrong
- Set root directory to `/` or empty

**"Port 8080 is already in use"**
- Fix: Add `PORT=8080` environment variable

**Database connection errors**
- Fix: Check DATABASE_URL is correct
- Verify Supabase allows connections from Railway IPs

---

## 💡 Alternative: Use Render.com

If Railway keeps failing, Render.com is easier for monorepos:

### Render Setup:

1. Go to: https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select repo: **Akshar789/Vault**
5. Configure:
   - **Name**: `vault-backend`
   - **Root Directory**: **LEAVE EMPTY**
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/backend
     ```
   - **Start Command**: 
     ```bash
     node apps/backend/dist/main.js
     ```
   - **Plan**: Free

6. Add all environment variables (same as Railway)
7. Click **"Create Web Service"**

Render handles monorepos better and the free tier is generous (750 hours/month).

---

## 🎯 Summary

**Railway Settings:**
- Root Directory: `/` or empty
- Build Command: empty (use nixpacks.toml)
- Start Command: empty (use nixpacks.toml)
- All environment variables set

**Files in repo:**
- ✅ `apps/backend/nixpacks.toml` (handles build)
- ✅ `apps/backend/railway.json` (deployment config)

**After setup:**
1. Redeploy in Railway
2. Wait 5-7 minutes
3. Check logs for success
4. Test: `https://your-url.railway.app/health`

---

**The latest code with fixes is already pushed to GitHub. Just redeploy in Railway!**

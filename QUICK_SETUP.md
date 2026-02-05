# ⚡ Quick Setup - Connect to Supabase

## Current Situation

Your Vercel app: **https://vault-vert-eight.vercel.app**
- ✅ Deployed and working
- ❌ Using demo mode (browser storage only)
- ❌ NOT connected to Supabase database

**You created an account, but the data is only in your browser's localStorage, not in Supabase.**

---

## 🎯 What You Need to Do

To see data in Supabase, follow these 3 steps:

### Step 1: Deploy Backend (10 minutes)

The backend needs to be running on a server to connect to Supabase.

**Option A: Deploy to Fly.io (Recommended - FREE)**

```bash
# Install Fly.io CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth login

# Deploy backend
cd apps/backend
fly launch --name vault-backend-akshar

# Set environment variables (copy from apps/backend/.env)
fly secrets set DATABASE_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres"
fly secrets set SUPABASE_URL="https://zkmolpbnqdgsvsulyzec.supabase.co"
fly secrets set REDIS_URL="rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379"
fly secrets set JWT_SECRET="K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC"
fly secrets set JWT_REFRESH_SECRET="X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG"

# Deploy
fly deploy
```

Your backend will be at: `https://vault-backend-akshar.fly.dev`

---

### Step 2: Disable Demo Mode

Edit this file: `apps/frontend/lib/vault-manager.ts`

Change line 10 from:
```typescript
const DEMO_MODE = true; // Set to false when backend is ready
```

To:
```typescript
const DEMO_MODE = false; // Backend is ready!
```

---

### Step 3: Configure Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://vault-backend-akshar.fly.dev/api`
   - Select all environments (Production, Preview, Development)
6. Click **Save**

---

### Step 4: Push Changes

```bash
git add apps/frontend/lib/vault-manager.ts
git commit -m "feat: Connect to Supabase backend"
git push origin main
```

Vercel will automatically redeploy (takes 2 minutes).

---

## ✅ Verify It Works

1. Wait for Vercel to finish deploying
2. Go to: https://vault-vert-eight.vercel.app/register
3. Create a NEW account (demo data won't transfer)
4. Go to Supabase dashboard: https://supabase.com/dashboard
5. Open your project
6. Click **Table Editor** > **users**
7. **You should see your user!** 🎉

---

## 🔍 Check Backend Health

Before testing, verify your backend is running:

Visit: `https://vault-backend-akshar.fly.dev/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

## 📊 What Will Change

| Before (Demo Mode) | After (Backend Mode) |
|-------------------|---------------------|
| Data in browser only | Data in Supabase database |
| No backend needed | Backend required |
| Can't see in Supabase | ✅ Can see in Supabase |
| Single device only | Works across devices |
| No data backup | Cloud backup |

---

## ⚠️ Important Notes

1. **Demo data won't transfer**: Data created in demo mode stays in browser localStorage
2. **Create new account**: After switching to backend mode, create a fresh account
3. **Backend must be running**: If backend is down, app won't work
4. **Environment variables**: Must be set in Vercel for production

---

## 🆘 Quick Troubleshooting

### "Cannot connect to backend"
- Check backend is running: `https://vault-backend-akshar.fly.dev/api/health`
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check Vercel deployment logs

### "Database connection error"
- Check Fly.io logs: `fly logs`
- Verify DATABASE_URL secret is set correctly
- Check Supabase is accessible

### Still seeing demo mode behavior
- Verify `DEMO_MODE = false` in code
- Check Vercel redeployed successfully
- Clear browser cache and try again

---

## 🎯 Summary

**Current**: Demo mode → Data in browser localStorage
**Goal**: Backend mode → Data in Supabase database

**Steps**:
1. Deploy backend to Fly.io
2. Change `DEMO_MODE = false`
3. Set `NEXT_PUBLIC_API_URL` in Vercel
4. Push to GitHub
5. Create new account
6. Check Supabase! 🎉

---

**Want me to help you through each step?** Just let me know!

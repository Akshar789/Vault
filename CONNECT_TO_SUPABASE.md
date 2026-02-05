# 🔌 Connect Your Vercel App to Supabase

## Current Status

Your app is in **DEMO MODE**:
- ❌ NOT connected to Supabase database
- ❌ Data stored in browser localStorage only
- ❌ No backend server running

## Why You Don't See Data in Supabase

When `DEMO_MODE = true`, the app:
1. Stores data in browser localStorage
2. Never talks to the backend
3. Never writes to Supabase database

**To see data in Supabase, you need to:**
1. Deploy the backend server
2. Disable demo mode
3. Connect Vercel to the backend

---

## 🚀 Option 1: Deploy Backend to Fly.io (Recommended)

### Step 1: Install Fly.io CLI

**Windows:**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login to Fly.io

```bash
fly auth login
```

### Step 3: Deploy Backend

```bash
cd apps/backend
fly launch --name vault-backend-akshar
```

When prompted:
- Choose a region (closest to you)
- Don't deploy PostgreSQL (you're using Supabase)
- Don't deploy Redis (you're using Upstash)

### Step 4: Set Environment Variables on Fly.io

```bash
fly secrets set \
  DATABASE_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres" \
  DIRECT_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres" \
  SUPABASE_URL="https://zkmolpbnqdgsvsulyzec.supabase.co" \
  SUPABASE_ANON_KEY="sb_publishable_DnG9gbdp_jQFVHRtwdrsBQ_iN0wZX-5" \
  SUPABASE_SERVICE_ROLE_KEY="sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD" \
  REDIS_URL="rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379" \
  JWT_SECRET="K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC" \
  JWT_REFRESH_SECRET="X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG" \
  NODE_ENV="production"
```

### Step 5: Deploy

```bash
fly deploy
```

Your backend will be live at: `https://vault-backend-akshar.fly.dev`

### Step 6: Disable Demo Mode

Edit `apps/frontend/lib/vault-manager.ts`:
```typescript
// Change this line:
const DEMO_MODE = false; // Changed from true to false
```

### Step 7: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: `vault-vert-eight`
3. Go to **Settings** > **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://vault-backend-akshar.fly.dev/api`
   - **Environment**: Production, Preview, Development

### Step 8: Push Changes and Redeploy

```bash
git add apps/frontend/lib/vault-manager.ts
git commit -m "feat: Disable demo mode and connect to backend"
git push origin main
```

Vercel will auto-deploy with the new settings.

---

## 🚀 Option 2: Quick Test with Local Backend

If you just want to test the Supabase connection locally:

### Step 1: Start Backend Locally

```bash
cd apps/backend
npm run start:dev
```

Backend will run on: `http://localhost:3001`

### Step 2: Disable Demo Mode

Edit `apps/frontend/lib/vault-manager.ts`:
```typescript
const DEMO_MODE = false;
```

### Step 3: Start Frontend Locally

```bash
cd apps/frontend
npm run dev
```

Frontend will run on: `http://localhost:3002`

### Step 4: Test

1. Go to: `http://localhost:3002/register`
2. Create an account
3. Check Supabase dashboard - you should see data in `users` table!

---

## 🔍 Verify Supabase Connection

### Check Tables in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor**
4. You should see these tables:
   - `users`
   - `vault_items`
   - `refresh_tokens`
   - `audit_logs`

### Check Data After Registration

After creating an account with backend connected:
1. Go to Supabase dashboard
2. Click on `users` table
3. You should see your user record!

---

## 📊 What Changes When You Disable Demo Mode

| Feature | Demo Mode (true) | Backend Mode (false) |
|---------|------------------|----------------------|
| Data Storage | Browser localStorage | Supabase PostgreSQL |
| Backend API | Not used | Required |
| User Accounts | Local only | Synced to database |
| Data Persistence | Browser only | Cloud database |
| Multi-device | ❌ No | ✅ Yes |
| Data Backup | ❌ No | ✅ Yes |

---

## ⚠️ Important Notes

### Demo Mode vs Backend Mode

**Demo Mode (Current)**:
- ✅ Works immediately
- ✅ No backend needed
- ✅ No database needed
- ❌ Data only in browser
- ❌ Can't sync across devices

**Backend Mode (After Setup)**:
- ✅ Data in Supabase
- ✅ Sync across devices
- ✅ Data backed up
- ⚠️ Requires backend deployment
- ⚠️ Requires environment variables

### Migration Note

When you switch from demo mode to backend mode:
- Existing demo data (in localStorage) will NOT be migrated
- Users will need to create new accounts
- This is expected behavior

---

## 🎯 Recommended Approach

For your use case (wanting to see data in Supabase):

1. **Deploy backend to Fly.io** (takes 10 minutes)
2. **Disable demo mode**
3. **Update Vercel environment variables**
4. **Push to GitHub** (Vercel auto-deploys)
5. **Create new account** on Vercel app
6. **Check Supabase** - you'll see the data!

---

## 🆘 Troubleshooting

### Backend Won't Deploy
- Check Fly.io logs: `fly logs`
- Verify environment variables are set
- Check Dockerfile exists

### Vercel App Shows Errors
- Check browser console (F12)
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check backend is running: visit `https://your-backend.fly.dev/api/health`

### No Data in Supabase
- Verify `DEMO_MODE = false`
- Check backend logs for database connection errors
- Verify Supabase credentials are correct
- Test backend health endpoint

---

## 📞 Need Help?

If you want me to help you:
1. Deploy the backend to Fly.io
2. Configure everything
3. Connect to Supabase

Just let me know and I'll guide you through each step!

---

**Summary**: Your app currently uses demo mode (browser storage). To see data in Supabase, you need to deploy the backend and disable demo mode.

# 🎯 START HERE - Deploy Your Backend

## ✅ What's Ready

I've already done this for you:
1. ✅ Disabled demo mode
2. ✅ Configured Fly.io settings
3. ✅ Created deployment script
4. ✅ Pushed changes to GitHub

---

## 🚀 3 Simple Steps to Go Live

### Step 1: Install Fly.io CLI

Open **PowerShell as Administrator** and run:

```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Then restart your terminal!**

---

### Step 2: Login and Deploy

```bash
# Login to Fly.io (opens browser)
fly auth login

# Deploy backend (takes 5 minutes)
cd apps/backend
fly launch --name vault-backend-akshar --region iad --no-deploy
fly deploy
```

When prompted:
- ❌ Don't add PostgreSQL (you have Supabase)
- ❌ Don't add Redis (you have Upstash)
- ✅ Just deploy the app

---

### Step 3: Set Environment Variables

After deployment, set the secrets:

```bash
fly secrets set DATABASE_URL="postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres"

fly secrets set SUPABASE_URL="https://zkmolpbnqdgsvsulyzec.supabase.co"

fly secrets set SUPABASE_ANON_KEY="sb_publishable_DnG9gbdp_jQFVHRtwdrsBQ_iN0wZX-5"

fly secrets set SUPABASE_SERVICE_ROLE_KEY="sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD"

fly secrets set REDIS_URL="rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379"

fly secrets set JWT_SECRET="K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC"

fly secrets set JWT_REFRESH_SECRET="X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG"

fly secrets set CORS_ORIGINS="https://vault-vert-eight.vercel.app,http://localhost:3002"
```

---

## ✅ Verify Backend Works

Visit: **https://vault-backend-akshar.fly.dev/health**

You should see:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🌐 Update Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add new:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://vault-backend-akshar.fly.dev/api`
   - All environments

---

## 🎉 Test Your App

1. Go to: https://vault-vert-eight.vercel.app/register
2. Create account: `test@example.com` / `TestPassword123`
3. Add a password
4. Check Supabase dashboard - **you'll see the data!**

---

## 🆘 Need Help?

If anything fails, run:
```bash
fly logs
```

This shows you what's happening.

---

**That's it! Your app will be fully functional with Supabase!** 🚀

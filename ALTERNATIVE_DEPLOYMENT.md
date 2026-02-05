# 🚀 Alternative Deployment Options (No Fly.io CLI Needed!)

Since Fly.io CLI installation is having issues, here are easier alternatives:

---

## ✅ Option 1: Railway.app (EASIEST - Recommended)

Railway is super easy and has a great free tier!

### Step 1: Sign Up
1. Go to: https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 2: Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select: **Akshar789/Vault**
3. Select: **apps/backend** as root directory
4. Click "Deploy"

### Step 3: Add Environment Variables
In Railway dashboard, go to Variables tab and add:

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
CORS_ORIGINS=https://vault-vert-eight.vercel.app
```

### Step 4: Get Your URL
Railway will give you a URL like: `https://vault-backend-production.up.railway.app`

### Step 5: Update Vercel
Add environment variable in Vercel:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://your-railway-url.railway.app/api`

**Done!** 🎉

---

## ✅ Option 2: Render.com (Also Easy)

### Step 1: Sign Up
1. Go to: https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub: **Akshar789/Vault**
3. Configure:
   - **Name**: vault-backend
   - **Root Directory**: apps/backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add all the environment variables (same as Railway above)

### Step 4: Deploy
Click "Create Web Service"

Your backend will be at: `https://vault-backend.onrender.com`

### Step 5: Update Vercel
Add environment variable in Vercel:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://vault-backend.onrender.com/api`

**Done!** 🎉

---

## ✅ Option 3: Fix Fly.io CLI Installation

If you still want to use Fly.io, try this:

### Method 1: Manual Download
1. Go to: https://github.com/superfly/flyctl/releases
2. Download: `flyctl_*_Windows_x86_64.zip`
3. Extract to: `C:\flyctl`
4. Add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\flyctl`
5. Restart terminal
6. Run: `fly auth login`

### Method 2: Use PowerShell (Admin)
```powershell
# Run PowerShell as Administrator
iwr https://fly.io/install.ps1 -useb | iex

# Add to PATH manually
$env:Path += ";$env:USERPROFILE\.fly\bin"

# Restart terminal
fly auth login
```

### Method 3: Use Scoop (Package Manager)
```powershell
# Install Scoop first
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install flyctl
scoop install flyctl

# Login
fly auth login
```

---

## 🎯 Recommended: Use Railway.app

Railway is the easiest option:
- ✅ No CLI needed
- ✅ Deploy from GitHub directly
- ✅ Free tier (500 hours/month)
- ✅ Automatic HTTPS
- ✅ Easy environment variables
- ✅ Auto-deploys on git push

**Just go to https://railway.app and deploy in 5 minutes!**

---

## 📊 Comparison

| Platform | Ease of Use | Free Tier | CLI Required |
|----------|-------------|-----------|--------------|
| Railway | ⭐⭐⭐⭐⭐ | 500 hrs/mo | ❌ No |
| Render | ⭐⭐⭐⭐ | 750 hrs/mo | ❌ No |
| Fly.io | ⭐⭐⭐ | Good | ✅ Yes |
| Vercel | ⭐⭐ | Limited | ❌ No |

---

## 🆘 Need Help?

Let me know which platform you want to use and I'll guide you through it step by step!

**Recommendation**: Use Railway.app - it's the easiest and works great!

# 🚂 Deploy Backend with Railway.app (5 Minutes - No CLI!)

Railway is the easiest way to deploy your backend. No command line needed!

---

## 🎯 Step-by-Step Guide

### Step 1: Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **Akshar789/Vault**
4. Railway will ask for permissions - click **"Install & Authorize"**

---

### Step 3: Configure the Service

1. After selecting the repo, Railway will show deployment options
2. Click **"Add variables"** or go to **"Variables"** tab
3. Add these environment variables one by one:

```
DATABASE_URL
postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:6543/postgres

DIRECT_URL
postgresql://postgres:YJ32TmrReQe984xz@db.zkmolpbnqdgsvsulyzec.supabase.co:5432/postgres

SUPABASE_URL
https://zkmolpbnqdgsvsulyzec.supabase.co

SUPABASE_ANON_KEY
sb_publishable_DnG9gbdp_jQFVHRtwdrsBQ_iN0wZX-5

SUPABASE_SERVICE_ROLE_KEY
sb_secret_buFMVAi8EkvUqTpG0DROwQ_Qc8YNncD

REDIS_URL
rediss://default:AffpAAIncDFiMWNjMmY5ZGIxMjc0MzcyODQ1YjQxMzczZDNmYTAwNnAxNjM0NjU@concrete-starling-63465.upstash.io:6379

JWT_SECRET
K8vN2mP9xR4tY7wZ1aB5cD8eF3gH6jK0lM4nQ7rS2uV9xA1bC5dE8fG3hJ6kL0mN4pQ7rS2tU9vW1xY5zA8bC

JWT_REFRESH_SECRET
X9yZ2aB5cD8eF1gH4jK7lM0nP3qR6sT9uV2wX5yA8bC1dE4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG

NODE_ENV
production

PORT
8080

CORS_ORIGINS
https://vault-vert-eight.vercel.app,http://localhost:3002

JWT_ACCESS_EXPIRES_IN
15m

JWT_REFRESH_EXPIRES_IN
7d
```

---

### Step 4: Set Root Directory

1. Go to **"Settings"** tab
2. Find **"Root Directory"**
3. Set it to: `apps/backend`
4. Click **"Save"**

---

### Step 5: Deploy

1. Go back to **"Deployments"** tab
2. Railway will automatically start deploying
3. Wait 3-5 minutes for the build to complete
4. You'll see "Success" when done

---

### Step 6: Get Your Backend URL

1. Go to **"Settings"** tab
2. Click **"Generate Domain"** under "Networking"
3. Railway will give you a URL like:
   - `https://vault-backend-production.up.railway.app`
4. **Copy this URL!**

---

### Step 7: Test Your Backend

Visit your Railway URL + `/health`:
```
https://your-railway-url.up.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

✅ If you see this, your backend is working!

---

### Step 8: Update Vercel

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **vault-vert-eight**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app/api`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **"Save"**

---

### Step 9: Redeploy Vercel

1. Go to **"Deployments"** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait 2 minutes

---

### Step 10: Test Your App! 🎉

1. Go to: **https://vault-vert-eight.vercel.app/register**
2. Create a new account:
   - Email: `test@example.com`
   - Password: `TestPassword123`
3. Add a password item
4. **Check Supabase Dashboard!**

Go to: https://supabase.com/dashboard
- Click your project
- Go to **Table Editor**
- Click **users** table
- **You should see your user!** 🎉

---

## 🎯 Summary

| Step | What to Do | Where |
|------|-----------|-------|
| 1 | Sign up | https://railway.app |
| 2 | Deploy from GitHub | Select Akshar789/Vault |
| 3 | Add environment variables | Variables tab |
| 4 | Set root directory | Settings → apps/backend |
| 5 | Wait for deployment | Deployments tab |
| 6 | Generate domain | Settings → Networking |
| 7 | Test backend | Visit /health endpoint |
| 8 | Update Vercel | Add NEXT_PUBLIC_API_URL |
| 9 | Redeploy Vercel | Deployments tab |
| 10 | Test app | Create account & check Supabase |

---

## ✅ Checklist

After deployment, verify:

- [ ] Railway deployment shows "Success"
- [ ] Backend health endpoint returns 200 OK
- [ ] Vercel environment variable is set
- [ ] Vercel redeployed successfully
- [ ] Can create new account on Vercel app
- [ ] User appears in Supabase `users` table
- [ ] Can add password item
- [ ] Password appears in Supabase `vault_items` table
- [ ] Can logout and login again
- [ ] Data persists after login

---

## 🆘 Troubleshooting

### Railway Build Fails
- Check **"Build Logs"** in Railway
- Verify root directory is set to `apps/backend`
- Make sure all environment variables are set

### Backend Health Check Fails
- Check **"Deploy Logs"** in Railway
- Verify DATABASE_URL is correct
- Check if PORT is set to 8080

### Vercel App Shows "Network Error"
- Verify backend is running (check health endpoint)
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure CORS_ORIGINS includes your Vercel URL
- Check browser console (F12) for errors

### No Data in Supabase
- Verify backend is connected (check Railway logs)
- Test backend health endpoint
- Create a new account (demo data won't transfer)
- Check Supabase connection in Railway logs

---

## 💡 Railway Benefits

- ✅ **No CLI needed** - Everything in the browser
- ✅ **Free tier** - 500 hours/month (enough for your app)
- ✅ **Auto-deploy** - Pushes to GitHub auto-deploy
- ✅ **Easy setup** - Just click and configure
- ✅ **Great logs** - Easy to debug
- ✅ **Fast deployment** - Usually 3-5 minutes

---

## 🎊 You're Done!

Your password manager is now fully functional with:
- ✅ Backend on Railway
- ✅ Frontend on Vercel
- ✅ Database on Supabase
- ✅ Redis on Upstash
- ✅ All features working!

**Your app**: https://vault-vert-eight.vercel.app
**Your backend**: https://your-railway-url.up.railway.app

---

**Need help?** Let me know which step you're stuck on!

# 🚀 Deploy Backend and Connect to Supabase - READY TO GO!

## ✅ What I've Done

1. ✅ Disabled demo mode in `apps/frontend/lib/vault-manager.ts`
2. ✅ Updated Fly.io config with your app name
3. ✅ Created deployment script with your Supabase credentials
4. ✅ Everything is ready to deploy!

---

## 🎯 Step-by-Step Deployment

### Step 1: Install Fly.io CLI (if not installed)

**Windows PowerShell (Run as Administrator):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

After installation, **restart your terminal**.

---

### Step 2: Login to Fly.io

```bash
fly auth login
```

This will open your browser. Sign up or login with:
- GitHub account (recommended)
- Or email

**Fly.io is FREE** for small apps like this!

---

### Step 3: Deploy Backend (Automated)

I've created a script for you. Just run:

```bash
deploy-backend.bat
```

Or manually:

```bash
cd apps/backend
fly launch --name vault-backend-akshar --region iad --no-deploy
fly deploy
```

This will:
- Create your Fly.io app
- Set all environment variables (Supabase, Redis, JWT secrets)
- Deploy the backend
- Start the server

**Deployment takes 3-5 minutes.**

---

### Step 4: Verify Backend is Running

After deployment, test the health endpoint:

**Visit:** https://vault-backend-akshar.fly.dev/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

### Step 5: Update Vercel Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project: **vault-vert-eight**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://vault-backend-akshar.fly.dev/api`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

---

### Step 6: Push Changes to GitHub

```bash
git add -A
git commit -m "feat: Connect to Supabase backend - disable demo mode"
git push origin main
```

Vercel will automatically redeploy (takes 2 minutes).

---

### Step 7: Test Your Live App! 🎉

1. Wait for Vercel to finish deploying
2. Go to: **https://vault-vert-eight.vercel.app/register**
3. Create a NEW account:
   - Email: `test@example.com`
   - Password: `TestPassword123`
4. Add a password item
5. **Check Supabase Dashboard!**

---

## 🔍 Verify Data in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Table Editor**
4. Click on **users** table
5. **You should see your user!** 🎉
6. Click on **vault_items** table
7. **You should see your password (encrypted)!** 🎉

---

## 📊 What Changed

| Before | After |
|--------|-------|
| Demo mode enabled | ✅ Backend mode enabled |
| Data in browser only | ✅ Data in Supabase |
| No backend | ✅ Backend on Fly.io |
| Can't see in database | ✅ Can see in Supabase |
| Single device | ✅ Multi-device sync |

---

## 🎯 Your App URLs

- **Frontend (Vercel)**: https://vault-vert-eight.vercel.app
- **Backend (Fly.io)**: https://vault-backend-akshar.fly.dev
- **Backend Health**: https://vault-backend-akshar.fly.dev/health
- **Backend API**: https://vault-backend-akshar.fly.dev/api
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 🔐 Environment Variables Set

Your backend has these secrets configured:

✅ **Database**:
- `DATABASE_URL` - Supabase PostgreSQL (pooler)
- `DIRECT_URL` - Supabase PostgreSQL (direct)
- `SUPABASE_URL` - Supabase API URL
- `SUPABASE_ANON_KEY` - Public key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key

✅ **Redis**:
- `REDIS_URL` - Upstash Redis

✅ **Security**:
- `JWT_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CORS_ORIGINS` - Allowed origins (Vercel + localhost)

---

## 🆘 Troubleshooting

### Fly.io CLI Not Found
```bash
# Restart terminal after installation
# Or add to PATH manually
```

### Deployment Failed
```bash
# Check logs
fly logs

# Check status
fly status

# Redeploy
fly deploy
```

### Backend Health Check Fails
```bash
# Check if app is running
fly status

# View logs
fly logs

# Restart app
fly apps restart vault-backend-akshar
```

### Vercel App Shows "Network Error"
1. Verify backend is running: https://vault-backend-akshar.fly.dev/health
2. Check `NEXT_PUBLIC_API_URL` is set in Vercel
3. Verify CORS_ORIGINS includes your Vercel URL
4. Check browser console (F12) for errors

### No Data in Supabase
1. Verify backend is connected: Check Fly.io logs
2. Test backend health endpoint
3. Create a new account (demo data won't transfer)
4. Check Supabase logs for connection errors

---

## 📝 Useful Fly.io Commands

```bash
# View logs
fly logs

# Check status
fly status

# SSH into container
fly ssh console

# View secrets
fly secrets list

# Restart app
fly apps restart vault-backend-akshar

# Scale app
fly scale count 1

# View dashboard
fly dashboard
```

---

## 🎊 Success Checklist

After deployment, verify:

- [ ] Backend health endpoint returns 200 OK
- [ ] Vercel environment variable is set
- [ ] GitHub changes are pushed
- [ ] Vercel redeployed successfully
- [ ] Can create new account on Vercel app
- [ ] User appears in Supabase `users` table
- [ ] Can add password item
- [ ] Password appears in Supabase `vault_items` table (encrypted)
- [ ] Can logout and login again
- [ ] Data persists after login

---

## 🚀 Ready to Deploy?

Run these commands:

```bash
# 1. Login to Fly.io
fly auth login

# 2. Deploy backend
deploy-backend.bat

# 3. Push to GitHub
git add -A
git commit -m "feat: Connect to Supabase backend"
git push origin main

# 4. Set Vercel env var (via dashboard)
# 5. Test your app!
```

---

**Your password manager will be fully functional with Supabase in 10 minutes!** 🎉

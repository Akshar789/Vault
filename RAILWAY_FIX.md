# 🔧 Fix Railway Deployment Crash

Your Railway deployment is crashing because it's a monorepo. Here's how to fix it:

---

## 🎯 Quick Fix

### Step 1: Update Railway Settings

In your Railway dashboard:

1. Go to **Settings** tab
2. Find **"Root Directory"**
3. **REMOVE** the root directory setting (leave it empty or set to `/`)
4. Click **Save**

### Step 2: Update Build Settings

Still in Settings:

1. Find **"Build Command"**
2. Set it to:
```bash
npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/backend
```

3. Find **"Start Command"**
4. Set it to:
```bash
node apps/backend/dist/main.js
```

5. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait 3-5 minutes

---

## 🔍 Alternative: Check the Logs

If it still crashes, let's see what the error is:

1. In Railway, go to **"Deployments"** tab
2. Click on the crashed deployment
3. Look at the **"Deploy Logs"**
4. Find the error message (usually in red)

Common errors and fixes:

### Error: "Cannot find module"
**Fix**: Root directory is wrong
- Set root directory to `/` (empty)
- Update build command as shown above

### Error: "ENOENT: no such file or directory"
**Fix**: Build command is wrong
- Use the build command from Step 2 above

### Error: "Port already in use" or "EADDRINUSE"
**Fix**: Port configuration
- Add environment variable: `PORT=8080`

### Error: "Connection refused" or database errors
**Fix**: Environment variables missing
- Verify all environment variables are set
- Check DATABASE_URL is correct

---

## ✅ Correct Railway Configuration

Here's what your Railway settings should look like:

**Root Directory**: `/` (or empty)

**Build Command**:
```bash
npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/backend
```

**Start Command**:
```bash
node apps/backend/dist/main.js
```

**Environment Variables** (all should be set):
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`
- `PORT=8080`
- `CORS_ORIGINS=https://vault-vert-eight.vercel.app`

---

## 🆘 Still Crashing?

If it's still crashing after these fixes, please share:

1. The **Deploy Logs** (copy the error message)
2. Your **Settings** (screenshot of build/start commands)
3. Your **Variables** (just the names, not values)

Then I can help you fix the specific issue!

---

## 💡 Alternative: Use Render.com

If Railway keeps giving you trouble, Render.com might be easier:

1. Go to: https://render.com
2. Sign up with GitHub
3. Create **New Web Service**
4. Select your repo: **Akshar789/Vault**
5. Configure:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/main.js`
6. Add all environment variables
7. Deploy!

Render handles monorepos better than Railway.

---

## 🎯 Quick Test

After fixing, test your backend:

Visit: `https://your-railway-url.railway.app/health`

You should see:
```json
{"status":"ok","timestamp":"..."}
```

If you see this, your backend is working! ✅

---

**Let me know what error you see in the logs and I'll help you fix it!**

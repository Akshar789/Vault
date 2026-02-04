# Deploy Your Password Manager to Vercel (FREE)

## 🚀 Quick Deploy (2 Minutes)

### Step 1: Push to GitHub

Your code is already on GitHub at: https://github.com/Akshar789/Vault

Make sure the latest changes are pushed:
```bash
git add -A
git commit -m "feat: Add demo mode"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" (use GitHub account)
3. Click "Import Project"
4. Select your repository: `Akshar789/Vault`
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click "Deploy"

That's it! Your app will be live in 2 minutes at: `https://your-app.vercel.app`

### Step 3: Share the Link

Once deployed, you'll get a URL like:
- `https://vault-akshar789.vercel.app`

Share this link with anyone! They can:
- ✅ Create accounts
- ✅ Add passwords
- ✅ Use all features
- ✅ Everything works in demo mode

## 🌐 Option 2: Deploy to Netlify (Also FREE)

1. Go to https://netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Configure:
   - **Base directory**: `apps/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/frontend/.next`
6. Click "Deploy"

## 📱 Option 3: Share Locally (Temporary)

If you just want to show someone quickly:

### Using ngrok (Easiest)

1. Install ngrok: https://ngrok.com/download
2. Run your app: `npm run dev`
3. In another terminal: `ngrok http 3002`
4. Share the ngrok URL (e.g., `https://abc123.ngrok.io`)

**Note**: This URL only works while your computer is running the app.

### Using localtunnel

```bash
npm install -g localtunnel
npm run dev
# In another terminal:
lt --port 3002
```

Share the URL you get!

## 🎯 Recommended: Vercel

**Why Vercel?**
- ✅ FREE forever
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploys on git push
- ✅ Perfect for Next.js
- ✅ Custom domains
- ✅ No credit card needed

## 📝 After Deployment

Your password manager will be live with:
- ✅ Full functionality
- ✅ Demo mode (no backend needed)
- ✅ Real encryption
- ✅ All features working
- ✅ Data stored in browser
- ✅ Shareable link

## 🔐 Security Note

In demo mode:
- Data is stored in browser localStorage
- Each user has their own data
- Data is encrypted with AES-256-GCM
- No data is sent to any server
- Perfect for testing and demos

## 🚀 Production Deployment

For production with backend:
1. Deploy backend to Fly.io (see `docs/FLY_DEPLOYMENT.md`)
2. Set `DEMO_MODE = false` in `apps/frontend/lib/vault-manager.ts`
3. Set `NEXT_PUBLIC_API_URL` environment variable in Vercel
4. Redeploy

## 📞 Support

- GitHub: https://github.com/Akshar789/Vault
- Issues: https://github.com/Akshar789/Vault/issues

---

**Your password manager is ready to share! 🎉**

Deploy to Vercel and get a public URL in 2 minutes!

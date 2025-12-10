# 🚀 Deploy to Vercel - Step by Step

## Prerequisites
- GitHub/GitLab account with your code
- Vercel account (free at vercel.com)

---

## 📦 **Step 1: Prepare Your Project**

### 1.1 Create `vercel.json` Configuration

Create this file in your project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

This ensures:
- React Router works (SPA routing)
- Static assets are cached properly

### 1.2 Update `.gitignore`

Make sure these are in `.gitignore`:

```
.env
.env.local
.vercel
node_modules
dist
```

### 1.3 Commit Your Code

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 🌐 **Step 2: Deploy to Vercel**

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. Click **"Add New Project"**
4. **Import your repository**
5. Vercel auto-detects settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: inreach-manager
# - Which directory? ./
# - Auto-detected settings OK? Yes

# Deploy to production
vercel --prod
```

---

## 🔑 **Step 3: Configure Environment Variables**

### In Vercel Dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_API_BASE_URL = https://magnus-garmin-ecc.onrender.com
VITE_API_KEY = your_production_api_key_here
```

4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Redeploy After Adding Variables

```bash
# In Vercel dashboard: Deployments → ... → Redeploy
# Or via CLI:
vercel --prod
```

---

## ✅ **Step 4: Verify Deployment**

### Test Your App

1. **Visit your Vercel URL**
   - `https://inreach-manager.vercel.app` (or your custom domain)

2. **Check API Connection**
   - Go to Settings → Backend API
   - Should show "Connected" (if API key is set)
   - Mock Mode should be OFF

3. **Test Features**
   - Navigate between pages (routing works)
   - Create/edit data (API calls work)
   - Check console for errors

### Common Issues & Fixes

**Issue: "Mock Mode" still showing**
- Check environment variables are set
- Redeploy after adding variables
- Clear browser cache

**Issue: API calls failing with CORS**
- Your Render backend needs CORS configured
- See "Backend CORS Setup" below

**Issue: 404 on page refresh**
- Make sure `vercel.json` is configured correctly
- Redeploy

---

## 🔒 **Backend CORS Setup**

Your Render backend needs to allow requests from Vercel:

```javascript
// In your backend (Express example)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',                    // Local dev
    'https://inreach-manager.vercel.app',       // Production
    'https://*.vercel.app',                     // Preview deploys
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
}));
```

Or allow all (less secure):
```javascript
app.use(cors());
```

---

## 🌍 **Step 5: Custom Domain (Optional)**

### Add Your Own Domain

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Click "Add Domain"
   - Enter: `inreach.magnus.co.il` (example)

2. **Update DNS:**
   - Add CNAME record:
     ```
     inreach → cname.vercel-dns.com
     ```
   - Or A record to Vercel's IP

3. **Wait for DNS propagation** (5-30 minutes)

4. **HTTPS automatically configured!**

---

## 🔄 **Automatic Deployments**

### Main Branch → Production
- Every push to `main` deploys to production
- URL: `https://inreach-manager.vercel.app`

### Feature Branches → Preview
- Every PR gets a preview URL
- URL: `https://inreach-manager-git-feature-branch.vercel.app`
- Perfect for testing before merge

### Disable Auto-Deploy (Optional)
- Settings → Git → Auto Deploy: Off
- Deploy manually from dashboard

---

## 📊 **Monitor Your App**

### Vercel Analytics (Free)

1. **Enable in Dashboard:**
   - Analytics → Enable Web Analytics

2. **See metrics:**
   - Page views
   - Load times
   - Core Web Vitals
   - User geography

### Deployment Logs

- Deployments tab → Click any deployment → View logs
- See build output, errors, warnings

---

## 💰 **Pricing**

### Free Tier (Hobby) - Perfect for You!
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ Preview deployments
- ✅ Analytics

### Pro Tier ($20/mo) - Only if you need:
- More bandwidth
- Team collaboration
- Advanced analytics
- Password protection

**Your app will be fine on Free tier!**

---

## 🎯 **Production Checklist**

Before going live:

- [ ] Environment variables set in Vercel
- [ ] Backend CORS configured for Vercel domain
- [ ] Mock mode is OFF (check settings)
- [ ] API key is production key (not dev key)
- [ ] Test all critical features
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Enable Vercel analytics
- [ ] Set up custom domain (optional)
- [ ] Update documentation with production URL

---

## 🆘 **Troubleshooting**

### Build Fails

**Check build logs:**
```bash
vercel logs <deployment-url>
```

**Common fixes:**
- Make sure `package.json` has correct scripts
- Check for TypeScript errors: `npm run build` locally
- Verify all dependencies are in `package.json`

### Runtime Errors

**Check browser console:**
- API endpoint correct?
- API key set?
- CORS configured on backend?

**Check Vercel logs:**
- Deployments → Functions → Logs
- (Though this is SPA, so most logs are client-side)

### Performance Issues

**Optimize build:**
- Vercel automatically minifies
- Images should be optimized
- Use lazy loading for routes

---

## 🚀 **Advanced: Multiple Environments**

### Production, Staging, Development

**1. Create branches:**
```bash
git checkout -b staging
git push origin staging
```

**2. In Vercel:**
- Production: `main` branch
- Staging: `staging` branch
- Preview: All PRs

**3. Different env variables:**
- Production: Real API key
- Staging: Test API key
- Preview: Mock mode ON

---

## 📝 **Example Build Output**

```
✓ Building...
✓ Compiled successfully
✓ Uploading...
✓ Deploying...
✓ Ready! Published to https://inreach-manager.vercel.app

Build time: 45s
```

---

## 🎉 **You're Live!**

Your app is now:
- 🌍 Accessible worldwide
- 🔒 Secured with HTTPS
- ⚡ Blazing fast (edge network)
- 🔄 Auto-deploys on git push
- 📊 Analytics enabled
- 💰 Free forever (hobby tier)

**Next:** Share the URL with your team!

---

## 📞 **Need Help?**

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** support@vercel.com
- **Community:** https://github.com/vercel/vercel/discussions

---

**Enjoy your deployment!** 🚀

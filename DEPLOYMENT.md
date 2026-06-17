# Fraud Sentinel - Render Deployment Guide

## 📋 Prerequisites
- Render account (https://render.com)
- GitHub account with your repository
- SMTP credentials (for email notifications)

## 🚀 Deployment Steps

### Option 1: Deploy Using Blueprint (Recommended)

1. **Fork/Push this repository to GitHub**

2. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com/

3. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

4. **Configure Environment Variables**
   - Set these manually in Render dashboard:
     - `SMTP_HOST` - Your SMTP server (e.g., smtp.gmail.com)
     - `SMTP_PASSWORD` - Your SMTP password or app password
     - `SMTP_EMAIL` - Your email address
   - These variables are already auto-configured:
     - `DATABASE_URL` (from PostgreSQL database)
     - `JWT_SECRET` (auto-generated)
     - `VITE_API_URL` (set to API URL)

5. **Deploy**
   - Click "Apply" to deploy all services

---

### Option 2: Manual Deployment

#### Step 1: Deploy PostgreSQL Database

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Name: `fraud-sentinel-db`
3. Database: `fraud_sentinel`
4. Plan: Free
5. Click "Create Database"
6. Copy the "Internal Database URL" (you'll need this)

#### Step 2: Deploy Backend API

1. Go to Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `fraud-sentinel-api`
   - **Runtime:** Node
   - **Region:** Oregon (or your preferred region)
   - **Branch:** main
   - **Root Directory:** (leave empty)
   - **Build Command:** `pnpm install --frozen-lockfile && pnpm run build`
   - **Start Command:** `pnpm run start`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<paste from Step 1>
   JWT_SECRET=<generate a secure random string>
   FRONTEND_URL=https://fraud-sentinel-dashboard.onrender.com
   PORT=8080
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=<your-email>
   SMTP_PASSWORD=<your-app-password>
   ADMIN_EMAIL=hhr135696@gmail.com
   ```

5. Click "Create Web Service"
6. **Copy the API URL** (e.g., https://fraud-sentinel-api.onrender.com)

#### Step 3: Deploy Frontend Dashboard

1. Go to Dashboard → "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `fraud-sentinel-dashboard`
   - **Branch:** main
   - **Root Directory:** `artifacts/fraud-dashboard`
   - **Build Command:** `pnpm install && pnpm run build`
   - **Publish Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL=<paste API URL from Step 2>/api
   ```

5. Click "Create Static Site"

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings
After deployment, update your API's CORS to allow your frontend URL:
- Frontend URL: `https://fraud-sentinel-dashboard.onrender.com`

### 2. Seed Database (Optional)
SSH into your API service or use Render Shell:
```bash
node scripts/seed-database.js
```

### 3. Test Endpoints
- API Health: `https://fraud-sentinel-api.onrender.com/api/healthz`
- Dashboard: `https://fraud-sentinel-dashboard.onrender.com`

---

## 📧 SMTP Configuration

### Using Gmail
1. Enable 2-Factor Authentication
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Create app password for "Mail"
3. Use this as `SMTP_PASSWORD`

### Environment Variables
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=<16-character-app-password>
```

---

## 🔍 Troubleshooting

### Issue: "No QueryClient set" error
✅ Fixed in this deployment - AuthProvider is properly wrapped in QueryClientProvider

### Issue: API returns 502/503
- Check if API service is running in Render dashboard
- Verify DATABASE_URL is set correctly
- Check logs for connection errors

### Issue: CORS errors
- Ensure FRONTEND_URL is set in API environment
- Check CORS configuration in `artifacts/api-server/src/app.ts`

### Issue: Database connection failed
- Verify DATABASE_URL format
- Check if PostgreSQL instance is running
- Ensure database is in the same region as API

### Issue: Build failed
- Check if pnpm is installed correctly
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:
- **API:** Triggers on any change to `/artifacts/api-server/**`
- **Dashboard:** Triggers on any change to `/artifacts/fraud-dashboard/**`

---

## 📊 Monitoring

1. **Logs:** Available in Render Dashboard → Service → Logs
2. **Metrics:** Render Dashboard → Service → Metrics
3. **Health Checks:** Automatic via `/api/healthz`

---

## 💰 Cost Optimization

### Free Tier Limits
- **Web Services:** Spin down after 15 min of inactivity
- **PostgreSQL:** 90 days retention, 1GB storage
- **Static Sites:** Unlimited bandwidth

### Upgrading
For production use, consider:
- Upgrading API to Starter ($7/mo) - No spin down
- Upgrading DB to Starter ($7/mo) - Better performance

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT_SECRET** (32+ characters)
3. **Enable rate limiting** (already configured)
4. **Regular security updates:** `pnpm update`
5. **Monitor logs** for suspicious activity

---

## 📞 Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Create an issue in your repository

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] API deployed and healthy
- [ ] Dashboard deployed and accessible
- [ ] Environment variables configured
- [ ] SMTP credentials set
- [ ] CORS configured
- [ ] Database seeded (optional)
- [ ] Test login functionality
- [ ] Test transaction monitoring
- [ ] Test fraud alerts

---

**Your URLs:**
- API: `https://fraud-sentinel-api.onrender.com`
- Dashboard: `https://fraud-sentinel-dashboard.onrender.com`
- Health Check: `https://fraud-sentinel-api.onrender.com/api/healthz`

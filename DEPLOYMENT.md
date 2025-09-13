# 🚀 Deployment Guide - Credit Prediction App

This guide will help you deploy your credit prediction app to Railway for free.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Model Files** - Ensure your `.joblib` files are in `backend/artifacts/`

## 🎯 Deployment Strategy

We'll deploy:
- **Backend** (FastAPI) → Railway
- **Frontend** (React) → Railway (or Vercel as alternative)

## 📁 Files Created for Deployment

### Backend Files:
- `backend/Dockerfile` - Container configuration
- `backend/Procfile` - Process definition
- `backend/runtime.txt` - Python version
- `backend/railway.toml` - Railway configuration
- `backend/app.json` - Heroku-compatible config

### Frontend Files:
- `frontend/Dockerfile` - Container configuration
- `frontend/railway.toml` - Railway configuration
- `frontend/app.json` - Heroku-compatible config

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push all files to GitHub**:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Verify model files are included**:
   - `backend/artifacts/best_regression_pipeline.joblib`
   - `backend/artifacts/best_classification_pipeline.joblib`

### Step 2: Deploy Backend to Railway

1. **Go to [railway.app](https://railway.app)** and sign in
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**
5. **Select the `backend` folder** (not the root)
6. **Railway will auto-detect Python and install dependencies**
7. **Wait for deployment to complete**
8. **Copy the generated URL** (e.g., `https://your-backend-app.railway.app`)

### Step 3: Deploy Frontend to Railway

1. **Create another Railway project**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**
4. **Select the `frontend` folder**
5. **Add environment variable**:
   - Key: `VITE_API_BASE`
   - Value: `https://your-backend-app.railway.app` (from Step 2)
6. **Deploy and wait for completion**

### Step 4: Test Your Deployment

1. **Visit your frontend URL**
2. **Test the health check**: Go to `https://your-backend-app.railway.app/health`
3. **Try making predictions** through the frontend

## 🔧 Alternative: Vercel for Frontend

If you prefer Vercel for the frontend:

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Set root directory to `frontend`**
4. **Add environment variable**:
   - `VITE_API_BASE` = `https://your-backend-app.railway.app`
5. **Deploy**

## 🌐 Custom Domain (Optional)

### Railway Custom Domain:
1. **Go to your Railway project settings**
2. **Click "Domains"**
3. **Add your custom domain**
4. **Update DNS records as instructed**

### Vercel Custom Domain:
1. **Go to project settings**
2. **Add domain**
3. **Configure DNS**

## 🔍 Troubleshooting

### Common Issues:

1. **Backend not starting**:
   - Check if model files are present
   - Verify Python version compatibility
   - Check Railway logs

2. **Frontend can't connect to backend**:
   - Verify `VITE_API_BASE` environment variable
   - Check CORS settings in backend
   - Ensure backend URL is correct

3. **Model loading errors**:
   - Ensure `.joblib` files are in `backend/artifacts/`
   - Check scikit-learn version compatibility

### Checking Logs:

**Railway**:
- Go to your project dashboard
- Click on "Deployments"
- Click on the latest deployment
- View logs in the "Logs" tab

**Vercel**:
- Go to your project dashboard
- Click on "Functions" tab
- View build and runtime logs

## 📊 Monitoring Your App

### Railway Dashboard:
- View deployment status
- Monitor resource usage
- Check logs
- View metrics

### Health Checks:
- Backend: `https://your-backend-app.railway.app/health`
- Frontend: `https://your-frontend-app.railway.app`

## 💰 Cost Management

### Railway Free Tier:
- $5 credit monthly
- Usually sufficient for small apps
- Monitor usage in dashboard

### Vercel Free Tier:
- Unlimited static sites
- 100GB bandwidth
- Perfect for React frontends

## 🔄 Updating Your App

1. **Make changes locally**
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```
3. **Railway/Vercel will auto-deploy**

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)

---

**Your app will be live at:**
- Frontend: `https://your-frontend-app.railway.app`
- Backend API: `https://your-backend-app.railway.app`

🎉 **Congratulations! Your credit prediction app is now deployed!**

# WellNest Deployment Guide

## Prerequisites
- GitHub account
- Render.com account (free)
- Netlify account (free)
- MongoDB Atlas (already configured ✅)

---

## 📦 Step 1: Push Code to GitHub

```bash
# Navigate to your project root
cd E:\wellnest\Springboard

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - WellNest App"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/wellnest.git
git branch -M main
git push -u origin main
```

---

## 🖥️ Step 2: Deploy Backend to Render.com

### 2.1 Create Web Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `wellnest` repository

### 2.2 Configure Service
- **Name**: `wellnest-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `wellnest-backend`
- **Runtime**: `Java`
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/wellnest-backend-1.0.0.jar`
- **Instance Type**: `Free`

### 2.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

```
SPRING_PROFILES_ACTIVE=production
MONGODB_URI=mongodb+srv://wellnest_user:Harishk.j12@cluster0.y3snqo0.mongodb.net/wellnest_db?retryWrites=true&w=majority
JWT_SECRET=YourSuperSecretJWTKey2026ChangeThisInProduction
MAIL_USERNAME=aswinarish@gmail.com
MAIL_PASSWORD=cnsiybtbbgungbpd
CORS_ORIGINS=https://your-app.netlify.app
```

### 2.4 Deploy
- Click **"Create Web Service"**
- Wait 5-10 minutes for build to complete
- Copy your backend URL: `https://wellnest-backend.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 3.2 Build and Deploy
```bash
# Navigate to frontend
cd E:\wellnest\Springboard\wellnest-frontend

# Login to Netlify
netlify login

# Deploy
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Select your team
- **Site name**: `wellnest-app` (or your choice)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3.3 Add Environment Variable to Netlify
```bash
# After deployment, add your backend URL
netlify env:set VITE_API_URL https://wellnest-backend.onrender.com/api
```

Or via Netlify Dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add: `VITE_API_URL` = `https://wellnest-backend.onrender.com/api`

### 3.4 Redeploy Frontend
```bash
netlify deploy --prod
```

Your app will be live at: `https://wellnest-app.netlify.app`

---

## 🔄 Step 4: Update Backend CORS

1. Go back to Render.com dashboard
2. Open your `wellnest-backend` service
3. Go to **Environment** tab
4. Update `CORS_ORIGINS` variable with your Netlify URL:
   ```
   CORS_ORIGINS=https://wellnest-app.netlify.app
   ```
5. Click **"Save Changes"** (backend will auto-redeploy)

---

## ✅ Step 5: Test Your Deployment

1. Open `https://wellnest-app.netlify.app`
2. Click **Register** and create an account
3. Check your email for OTP
4. Test login and all features

---

## 🚨 Important Notes

### Free Tier Limitations
- **Render**: Service sleeps after 15 min of inactivity (first request takes 30-60s to wake up)
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month

### Security
- Change `JWT_SECRET` to a strong random string in production
- Never commit `.env` files or passwords to GitHub
- Consider using Render's secret management for sensitive data

### Custom Domain (Optional)
- **Netlify**: Settings → Domain Management → Add custom domain
- **Render**: Settings → Custom Domain → Add your domain

---

## 📱 Alternative: Quick Deploy (No CLI)

### Backend (Render - Web UI)
1. Push code to GitHub
2. Import from GitHub on Render.com
3. Set environment variables in dashboard
4. Deploy

### Frontend (Netlify - Drag & Drop)
1. Build locally: `cd wellnest-frontend && npm run build`
2. Go to https://app.netlify.com/drop
3. Drag & drop the `dist` folder
4. Set environment variables in Site Settings

---

## 🛠️ Troubleshooting

**Backend won't start?**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB URI is correct

**Frontend can't connect to backend?**
- Check CORS_ORIGINS matches your Netlify URL exactly
- Verify VITE_API_URL is set correctly
- Check browser console for errors

**Email not working?**
- Verify Gmail app password is correct
- Check Render logs for email errors

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs
2. Check Netlify deploy logs: Deploys → [Latest Deploy]
3. Review browser console for frontend errors

---

**Deployment Status:**
- ✅ MongoDB Atlas (Hosted)
- ⏳ Backend (Ready to deploy to Render)
- ⏳ Frontend (Ready to deploy to Netlify)

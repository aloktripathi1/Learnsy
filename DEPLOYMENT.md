# 🚀 Migration & Deployment Guide

## Overview

This app has been migrated from **Supabase** to a more reliable and scalable stack:

- **Frontend**: Next.js hosted on **Vercel**
- **Database**: PostgreSQL hosted on **Neon** (serverless)
- **Authentication**: **Clerk** (modern auth with better UX)
- **APIs**: Next.js API routes

---

## 📋 Prerequisites

Before deploying, you'll need accounts on these platforms:

1. **Neon** (Database) - [https://neon.tech/](https://neon.tech/)
2. **Clerk** (Authentication) - [https://clerk.com/](https://clerk.com/)
3. **Vercel** (Hosting) - [https://vercel.com/](https://vercel.com/)
4. **Google Cloud Console** (YouTube API) - [https://console.cloud.google.com/](https://console.cloud.google.com/)

---

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create a Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"Create Project"**
3. Choose:
   - **Name**: learnsy-db
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 16 (recommended)
4. Click **"Create Project"**

### 1.2 Get Database Connection String

1. In your Neon project dashboard, click **"Connection Details"**
2. Copy the connection string (starts with `postgres://`)
3. Save it - you'll need it in `.env.local`

### 1.3 Run Database Schema

1. In Neon Console, go to **SQL Editor**
2. Copy the contents of `/database/schema.sql`
3. Paste and click **"Run"**
4. Verify tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

## 🔐 Step 2: Set Up Clerk Authentication

### 2.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click **"Add application"**
3. Choose:
   - **Name**: Learnsy
   - **Sign-in options**: Enable **Google** (recommended)
4. Click **"Create Application"**

### 2.2 Get API Keys

1. In your Clerk app dashboard, go to **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)
3. Save them - you'll need them in `.env.local`

### 2.3 Configure OAuth Providers

1. Go to **User & Authentication** → **Social Connections**
2. Enable **Google**
3. Follow Clerk's guide to set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs from Clerk
   - Enter Client ID and Secret in Clerk

### 2.4 Configure URLs

In Clerk Dashboard, go to **Paths**:
- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **Home URL**: `/dashboard`
- **After sign-in URL**: `/dashboard`
- **After sign-up URL**: `/dashboard`

---

## 🔑 Step 3: Set Up YouTube API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. (Optional) Restrict the API key to YouTube Data API v3 only

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Local Development

Create a `.env.local` file in the project root:

```env
# Database (Neon)
DATABASE_URL=postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Clerk URLs (optional - already set in middleware)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# YouTube API
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
```

### 4.2 Test Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and test:
- ✅ Sign in with Google
- ✅ Import a YouTube playlist
- ✅ Navigate through the app

---

## 🚢 Step 5: Deploy to Vercel

### 5.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 5.2 Configure Environment Variables

In Vercel project settings, go to **Environment Variables** and add:

```
DATABASE_URL = postgres://user:password@...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
YOUTUBE_API_KEY = AIzaSy...
```

**Important**: Make sure all variables are set for **Production**, **Preview**, and **Development** environments.

### 5.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Vercel will provide you with a URL: `https://your-app.vercel.app`

### 5.4 Update Clerk URLs

1. Go back to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Go to **Domains**
3. Add your Vercel domain: `your-app.vercel.app`
4. Update **Redirect URLs** in Social Connections (Google OAuth) to include:
   - `https://your-app.vercel.app`

---

## 🔄 Step 6: Migrate Existing Data (Optional)

If you have existing data in Supabase, you'll need to migrate it:

### 6.1 Export from Supabase

```sql
-- Export users (you'll need to manually create them in Clerk)
COPY (SELECT * FROM auth.users) TO '/tmp/users.csv' CSV HEADER;

-- Export courses
COPY (SELECT * FROM courses) TO '/tmp/courses.csv' CSV HEADER;

-- Export videos
COPY (SELECT * FROM videos) TO '/tmp/videos.csv' CSV HEADER;

-- Export user_progress
COPY (SELECT * FROM user_progress) TO '/tmp/user_progress.csv' CSV HEADER;

-- Export streak_activity
COPY (SELECT * FROM streak_activity) TO '/tmp/streak_activity.csv' CSV HEADER;

-- Export video_timestamps
COPY (SELECT * FROM video_timestamps) TO '/tmp/video_timestamps.csv' CSV HEADER;
```

### 6.2 Import to Neon

**Note**: User IDs will change because Clerk uses different IDs. You'll need to:
1. Create users in Clerk (they can sign in with Google)
2. Map old Supabase user IDs to new Clerk user IDs
3. Update all foreign keys in the data before importing

---

## 🎯 Step 7: Post-Deployment Checklist

After deployment, verify:

- [ ] **Authentication works**
  - Sign up with Google
  - Sign out and sign in again
  - User info displays correctly

- [ ] **Database operations work**
  - Import a YouTube playlist
  - Mark videos as completed
  - Add bookmarks
  - Create notes
  - View streak calendar

- [ ] **All pages load correctly**
  - Dashboard
  - Courses
  - Bookmarks
  - Notes
  - Study/video player

- [ ] **API routes work**
  - Check browser console for errors
  - Test playlist import
  - Verify data persistence

---

## 🆘 Troubleshooting

### Issue: "Database is not configured"
- **Solution**: Check that `DATABASE_URL` environment variable is set correctly in Vercel
- Restart the Vercel deployment after adding env vars

### Issue: "Unauthorized" or "Clerk not initialized"
- **Solution**: 
  - Verify Clerk API keys are correct
  - Check that domain is added in Clerk Dashboard
  - Clear browser cookies and try again

### Issue: "YouTube API quota exceeded"
- **Solution**: 
  - YouTube API has daily quotas (10,000 units/day free)
  - Each playlist import uses ~1-3 units per video
  - Wait 24 hours or upgrade your quota

### Issue: Build fails on Vercel
- **Solution**:
  - Check build logs in Vercel dashboard
  - Ensure all dependencies are in `package.json`
  - Run `npm run build` locally to test

### Issue: Database connection timeout
- **Solution**:
  - Neon free tier may suspend inactive databases
  - Visit Neon console to wake it up
  - Consider upgrading to paid plan for always-on databases

---

## 💰 Cost Estimates

### Free Tier (Suitable for personal use)
- **Neon**: 0.5 GB storage, 3 GB data transfer/month - **FREE**
- **Clerk**: 10,000 monthly active users - **FREE**
- **Vercel**: 100 GB bandwidth, unlimited deployments - **FREE**
- **YouTube API**: 10,000 units/day - **FREE**

**Total**: $0/month 🎉

### Paid Tier (For production apps)
- **Neon Pro**: $19/month (always-on, autoscaling)
- **Clerk Pro**: $25/month (advanced features)
- **Vercel Pro**: $20/month (analytics, increased limits)

**Total**: ~$64/month

---

## 🎊 Success!

Your app is now running on a modern, scalable, and reliable infrastructure!

**Live App**: `https://your-app.vercel.app`

For support or questions:
- **Neon Docs**: https://neon.tech/docs
- **Clerk Docs**: https://clerk.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## 📝 Key Changes from Supabase

| Feature | Supabase | New Stack |
|---------|----------|-----------|
| **Database** | Supabase Postgres | Neon Serverless Postgres |
| **Auth** | Supabase Auth | Clerk |
| **API** | Server Actions | Next.js API Routes |
| **Hosting** | Netlify | Vercel |
| **User IDs** | UUID (auth.users) | Clerk User IDs (string) |
| **Security** | Row Level Security (RLS) | Application-level auth checks |

---

## 🔒 Security Notes

- Never commit `.env.local` or expose API keys
- Clerk handles auth tokens and session management
- Database credentials are encrypted in Vercel
- All connections use SSL/TLS
- Implement rate limiting for production use

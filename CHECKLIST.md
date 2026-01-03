# 🎯 Pre-Deployment Checklist

Before deploying your app to production, complete these steps:

## ✅ Local Testing

- [ ] **Environment Variables Set**
  - [ ] `DATABASE_URL` configured
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` configured
  - [ ] `CLERK_SECRET_KEY` configured
  - [ ] `YOUTUBE_API_KEY` configured

- [ ] **Database Setup**
  - [ ] Neon project created
  - [ ] Database schema executed (`database/schema.sql`)
  - [ ] Connection string tested

- [ ] **Authentication Setup**
  - [ ] Clerk app created
  - [ ] Google OAuth enabled and configured
  - [ ] API keys copied to `.env.local`

- [ ] **Local Development Works**
  ```bash
  npm install
  npm run dev
  ```
  - [ ] App runs on http://localhost:3000
  - [ ] Can sign in with Google
  - [ ] Can import a YouTube playlist
  - [ ] Can mark videos as completed
  - [ ] Can add bookmarks and notes
  - [ ] Streak calendar displays

- [ ] **Build Succeeds**
  ```bash
  npm run build
  ```
  - [ ] No errors in build output
  - [ ] All pages compile successfully

## 🚢 Production Deployment

- [ ] **Code Repository**
  - [ ] Code pushed to GitHub
  - [ ] Old Supabase files removed or backed up
  - [ ] `.env.local` is in `.gitignore`

- [ ] **Vercel Setup**
  - [ ] Vercel account created
  - [ ] Repository imported to Vercel
  - [ ] Environment variables added:
    - [ ] `DATABASE_URL`
    - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - [ ] `CLERK_SECRET_KEY`
    - [ ] `YOUTUBE_API_KEY`

- [ ] **Clerk Production Config**
  - [ ] Vercel domain added to Clerk Dashboard
  - [ ] Production API keys used (not test keys)
  - [ ] Google OAuth redirect URIs updated

- [ ] **First Deployment**
  - [ ] Clicked "Deploy" in Vercel
  - [ ] Deployment succeeded
  - [ ] No build errors

## 🧪 Post-Deployment Testing

- [ ] **Authentication Flow**
  - [ ] Can access deployed URL
  - [ ] Sign up with Google works
  - [ ] Sign out works
  - [ ] Sign in again works
  - [ ] User info displays correctly

- [ ] **Core Features**
  - [ ] Can import YouTube playlist
  - [ ] Videos display correctly
  - [ ] Video player works
  - [ ] Can mark videos as completed
  - [ ] Can add bookmarks
  - [ ] Can create notes
  - [ ] Streak calendar updates

- [ ] **Data Persistence**
  - [ ] Sign out and sign back in
  - [ ] Previous data still there
  - [ ] Progress persists across sessions

- [ ] **Error Handling**
  - [ ] Check browser console for errors
  - [ ] Try importing invalid playlist URL
  - [ ] Try importing duplicate playlist
  - [ ] Check error messages display correctly

## 🔍 Monitoring

- [ ] **Service Dashboards**
  - [ ] Check Vercel deployment logs
  - [ ] Check Neon database metrics
  - [ ] Check Clerk user activity
  - [ ] Monitor YouTube API quota usage

- [ ] **Performance**
  - [ ] Page load times acceptable
  - [ ] API responses fast (<2s)
  - [ ] No console errors
  - [ ] Images load properly

## 📊 Optional Enhancements

- [ ] **Custom Domain**
  - [ ] Domain purchased
  - [ ] DNS configured in Vercel
  - [ ] SSL certificate auto-provisioned
  - [ ] Domain added to Clerk

- [ ] **Analytics**
  - [ ] Vercel Analytics enabled
  - [ ] Error tracking set up (Sentry, etc.)

- [ ] **Backups**
  - [ ] Neon automated backups enabled
  - [ ] Database backup schedule configured

- [ ] **Scaling**
  - [ ] Consider upgrading to paid tiers if needed
  - [ ] Set up monitoring alerts
  - [ ] Configure rate limiting

## 🆘 Troubleshooting Resources

If you encounter issues, refer to:

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
2. **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - What changed
3. **Service Documentation**:
   - Neon: https://neon.tech/docs
   - Clerk: https://clerk.com/docs
   - Vercel: https://vercel.com/docs

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Users can sign up and sign in
- ✅ Playlists can be imported
- ✅ Video playback works
- ✅ Progress tracking works
- ✅ Data persists across sessions
- ✅ No critical errors in console
- ✅ App is accessible via production URL

---

**Ready to deploy?** Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md)!

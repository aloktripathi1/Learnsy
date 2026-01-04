# Clerk Production Setup Guide

## Current Status
You're using **Clerk Test/Development Keys** which have strict usage limits and show the development banner.

## Step-by-Step Production Setup

### 1. Create a Production Instance in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click on your application "learnsy"
3. In the top-right corner, you'll see a dropdown that says "Development" - click it
4. Click "**Create Production Instance**" or "**Go to Production**"

### 2. Configure Production Domain

1. In Production mode, go to **"Domains"** in the left sidebar
2. Add your production domain: `learnsy.vercel.app`
3. Also add your local development domain if needed: `localhost:3000`

### 3. Configure OAuth Providers (Google Sign-In)

1. Go to **"Configure"** → **"SSO Connections"** → **"OAuth"**
2. Click on **"Google"**
3. Enable Google OAuth for production
4. You'll need to create a Google Cloud Console project:

#### Google Cloud Console Setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized JavaScript origins:
     - `https://learnsy.vercel.app`
     - `http://localhost:3000` (for development)
   - Add Authorized redirect URIs (Clerk will provide these):
     - `https://capital-buffalo-86.clerk.accounts.dev/v1/oauth_callback`
     - Or your custom domain redirect URL
   - Copy the Client ID and Client Secret
   - Paste them into Clerk's Google OAuth settings

### 4. Get Production API Keys

1. In Clerk Dashboard (Production mode), go to **"API Keys"**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

### 5. Update Environment Variables

#### For Local Development (.env.local):
Keep test keys for local development:
```bash
# Clerk Authentication - DEVELOPMENT
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1idWZmYWxvLTg2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_YDkoDlwAGLDZTiq3knUY8HLK0S9XLqWtH6j5TrQG8U
```

#### For Vercel Production:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project "learnsy"
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables for **Production** environment:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
   CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_KEY
   ```
5. Also set them for **Preview** if you want production keys on preview deployments

### 6. Redeploy Your Application

After adding production keys to Vercel:
```bash
git commit --allow-empty -m "trigger redeploy with production clerk keys"
git push
```

Or manually trigger a redeploy from Vercel Dashboard.

### 7. Test Production Sign-In

1. Visit https://learnsy.vercel.app
2. Click "Sign In"
3. Should now see production Clerk UI (no development warning)
4. Sign in with Google should work

## Common Issues & Fixes

### Issue: "Failed to sign in"
**Causes:**
- OAuth not configured in production
- Domain not whitelisted in Clerk
- Google OAuth redirect URIs not set correctly
- API keys not updated in Vercel

**Solution:**
- Verify all domains are added in Clerk Dashboard
- Double-check Google OAuth configuration
- Ensure production keys are set in Vercel environment variables

### Issue: "Development keys" warning still showing
**Cause:** Still using test keys (pk_test_* / sk_test_*)

**Solution:** Update to production keys (pk_live_* / sk_live_*)

### Issue: Redirect issues after sign-in
**Cause:** Incorrect redirect URLs

**Solution:** Verify these environment variables in Vercel:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Production Checklist

- [ ] Created production instance in Clerk
- [ ] Added production domain (learnsy.vercel.app) to Clerk
- [ ] Configured Google OAuth with production credentials
- [ ] Copied production API keys from Clerk
- [ ] Updated Vercel environment variables with production keys
- [ ] Redeployed application
- [ ] Tested sign-in on production URL
- [ ] No development warnings visible
- [ ] Google sign-in working correctly

## Additional Security (Recommended)

1. **Enable Multi-Factor Authentication (MFA)**
   - Clerk Dashboard → Configure → Authentication → Multi-factor

2. **Set Session Lifetime**
   - Clerk Dashboard → Configure → Sessions
   - Recommended: 7 days for inactive, 30 days max

3. **Configure Email/SMS Templates**
   - Customize welcome emails
   - Add your branding

4. **Enable Bot Protection**
   - Clerk Dashboard → Configure → Security → Bot protection

## Need Help?

- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Clerk with Vercel](https://clerk.com/docs/deployments/deploy-clerk-to-vercel)
- [Clerk Support](https://clerk.com/support)

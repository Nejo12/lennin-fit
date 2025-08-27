# Netlify Setup Guide for Lennin Fit

This guide walks you through setting up your new Netlify project with the optimal configuration.

## 🚀 Step-by-Step Setup

### 1. Create New Netlify Project

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click "New site from Git"**
3. **Choose GitHub** as your Git provider
4. **Select Repository**: `Nejo12/lennin-fit`

### 2. Project Configuration

#### **Project Name**

```
lennin-fit
```

- ✅ Use this exact name
- ✅ Matches your repository
- ✅ Professional and clean

#### **Base Directory**

```
(leave empty)
```

- ✅ Use root directory
- ✅ All config files are in root
- ✅ No subdirectory needed

#### **Build Command**

```
npm run build
```

- ✅ Already configured in `netlify.toml`
- ✅ Will be auto-detected

#### **Publish Directory**

```
dist
```

- ✅ Already configured in `netlify.toml`
- ✅ Will be auto-detected

### 3. Environment Variables Setup

**⚠️ CRITICAL**: Add these environment variables in Netlify dashboard:

#### **Required Variables**

```
VITE_APP_URL = https://tilsf.com
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

#### **Optional Variables**

```
VITE_AI_PROVIDER = mock
VITE_OPENAI_KEY = your_openai_key
VITE_POSTHOG_KEY = your_posthog_key
VITE_POSTHOG_HOST = https://app.posthog.com
```

### 4. How to Add Environment Variables

1. **In Netlify Dashboard**:
   - Go to Site Settings
   - Click "Environment variables"
   - Click "Add variable"

2. **For each variable**:
   - **Key**: `VITE_APP_URL`
   - **Value**: `https://tilsf.com`
   - **Scopes**: Production, Preview, Deploy Preview

3. **Repeat for all variables**

### 5. Domain Configuration

#### **Primary Domain**

1. Go to "Domain management"
2. Click "Add custom domain"
3. Enter: `lennin.fit`
4. Choose "Netlify DNS"

#### **Domain Alias**

1. Click "Add domain alias"
2. Enter: `tilsf.com`
3. Choose "Netlify DNS"

### 6. Build Settings Verification

Your `netlify.toml` should handle most settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher

### 7. Deploy Settings

#### **Branch Deploy**

- **Production branch**: `main`
- **Deploy previews**: Enabled
- **Branch deploys**: Disabled (unless needed)

#### **Build Hooks** (Optional)

- Create build hook for external triggers
- Useful for CMS integrations

## 🔧 Post-Setup Configuration

### 1. Supabase Authentication

1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. **Site URL**: `https://tilsf.com`
4. **Redirect URLs**:
   - `https://tilsf.com`
   - `https://tilsf.com/verify`
   - `https://tilsf.com/auth/callback`
   - `https://lennin.fit`
   - `https://lennin.fit/verify`

### 2. Form Handling (if using Netlify Forms)

- Forms will be automatically detected
- No additional configuration needed

### 3. Function Configuration (if using Netlify Functions)

- Create `netlify/functions/` directory
- Functions will be auto-deployed

## 🧪 Testing Your Setup

### 1. Test Build Locally

```bash
npm run test:build
```

### 2. Test Deployment

```bash
npm run deploy
```

### 3. Test Domains

```bash
npm run check:domains
```

### 4. Manual Testing

- Visit `https://lennin.fit`
- Visit `https://tilsf.com`
- Test authentication flow
- Test all app features

## 🚨 Common Issues & Solutions

### Build Failures

1. **Check Node version**: Ensure 18+ in Netlify
2. **Check environment variables**: All required vars set
3. **Check build logs**: Netlify dashboard → Deploys

### Domain Issues

1. **DNS propagation**: Can take 24-48 hours
2. **SSL certificate**: Should be automatic
3. **Redirect issues**: Check `netlify.toml` configuration

### Authentication Issues

1. **Supabase URL mismatch**: Check environment variables
2. **Redirect URL issues**: Verify Supabase configuration
3. **CORS issues**: Check domain configuration

## 📊 Monitoring & Maintenance

### 1. Set Up Notifications

- Deploy notifications
- Form submission notifications
- Error notifications

### 2. Analytics Setup

- Netlify Analytics (if enabled)
- PostHog integration
- Error tracking

### 3. Performance Monitoring

- Core Web Vitals
- Build performance
- Deploy times

## 🔄 Deployment Workflow

### Daily Development

```bash
npm run dev          # Local development
npm run test:build   # Test build locally
npm run deploy       # Deploy to production
```

### Emergency Deploy

```bash
npm run deploy:quick # Quick deployment without checks
```

### Domain Health Check

```bash
npm run check:domains # Test domain accessibility
```

---

**🎯 Success Criteria**: After setup, you should have:

- ✅ Working deployment pipeline
- ✅ Both domains accessible
- ✅ Authentication working
- ✅ All features functional
- ✅ Easy maintenance workflow

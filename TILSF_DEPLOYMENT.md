# 🚀 TILSF Microsite Deployment Guide

This guide will help you deploy the TILSF microsite to `tilsf.com` with optimal performance and SEO.

## 📋 Prerequisites

- [ ] Domain `tilsf.com` purchased and configured
- [ ] Netlify account (free tier works perfectly)
- [ ] Git repository with this codebase
- [ ] Node.js installed locally

## 🏗️ Build the TILSF Microsite

### Option 1: Local Build
```bash
# Build the TILSF microsite
npm run build:tilsf

# This creates a `dist-tilsf` directory with optimized files
```

### Option 2: CI/CD Build
```bash
# Add to your CI/CD pipeline
npm run build:tilsf
```

## 🌐 Deploy to Netlify

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify site**
   ```bash
   cd dist-tilsf
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Netlify Dashboard

1. **Go to [netlify.com](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect your repository**
4. **Set build settings:**
   - Build command: `npm run build:tilsf`
   - Publish directory: `dist-tilsf`
5. **Deploy**

### Method 3: Drag & Drop

1. **Build locally:**
   ```bash
   npm run build:tilsf
   ```

2. **Drag `dist-tilsf` folder to Netlify dashboard**

## 🔧 Configure Custom Domain

### 1. Add Domain in Netlify
- Go to Site Settings → Domain management
- Add custom domain: `tilsf.com`
- Add `www.tilsf.com` (will redirect to apex)

### 2. Configure DNS
Point your domain's DNS to Netlify:

```
Type    Name               Value
A       @                  75.2.60.5
CNAME   www               your-site.netlify.app
```

### 3. SSL Certificate
- Netlify automatically provisions SSL certificates
- Force HTTPS is enabled in `_redirects`

## 📊 Performance Optimization

### Built-in Optimizations
- ✅ **Critical CSS inlined** (~11KB)
- ✅ **No external dependencies** (except analytics)
- ✅ **Optimized images** (WebP when possible)
- ✅ **Security headers** configured
- ✅ **Caching strategies** implemented
- ✅ **Preconnect hints** for external resources

### Expected Performance Scores
- **Lighthouse Performance**: 95-100
- **Lighthouse Accessibility**: 95-100
- **Lighthouse Best Practices**: 95-100
- **Lighthouse SEO**: 95-100

## 🔍 SEO Configuration

### Meta Tags
- ✅ Title: "TILSF — Tasks, Invoices, Leads, Schedule, Focus"
- ✅ Description: "The five pillars freelancers need..."
- ✅ Open Graph tags configured
- ✅ Twitter Card tags configured
- ✅ Canonical URL set

### Technical SEO
- ✅ `robots.txt` optimized
- ✅ `sitemap.xml` generated
- ✅ Structured data ready
- ✅ Fast loading (< 1s)

## 📈 Analytics Setup

### Plausible Analytics
- ✅ Already configured in HTML
- ✅ Domain: `tilsf.com`
- ✅ Privacy-focused analytics

### UTM Tracking
- ✅ Hero CTA: `utm_campaign=hero_cta`
- ✅ Section CTA: `utm_campaign=cta_section`
- ✅ NoScript fallback: `utm_campaign=noscript`

## 🔒 Security Features

### Security Headers
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Strict-Transport-Security`
- ✅ `Referrer-Policy`
- ✅ `X-XSS-Protection`

### Content Security
- ✅ No inline scripts (except analytics)
- ✅ External resources whitelisted
- ✅ HTTPS enforced

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build:tilsf`
- [ ] Test locally: `cd dist-tilsf && python -m http.server 8000`
- [ ] Verify all assets load correctly
- [ ] Check responsive design
- [ ] Validate HTML: https://validator.w3.org/

### Post-Deployment
- [ ] Verify domain resolves: `curl -I https://tilsf.com`
- [ ] Check SSL certificate: https://www.ssllabs.com/ssltest/
- [ ] Run Lighthouse audit: https://pagespeed.web.dev/
- [ ] Test analytics tracking
- [ ] Verify redirects work (www → apex, HTTP → HTTPS)
- [ ] Check mobile performance

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
```yaml
name: Deploy TILSF
on:
  push:
    branches: [main]
    paths: ['public/tilsf.html', 'scripts/build-tilsf.js']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:tilsf
      - uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist-tilsf'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy TILSF microsite"
```

## 🐛 Troubleshooting

### Common Issues

**Domain not resolving:**
- Check DNS configuration
- Wait for DNS propagation (up to 48 hours)
- Verify Netlify DNS settings

**SSL certificate issues:**
- Netlify auto-provisions SSL
- Check domain verification in Netlify
- Ensure DNS is pointing to Netlify

**Build failures:**
- Check Node.js version (18+ recommended)
- Verify all dependencies installed
- Check file permissions

**Performance issues:**
- Verify critical CSS is inlined
- Check image optimization
- Run Lighthouse audit

## 📞 Support

- **Netlify Support**: https://docs.netlify.com/
- **DNS Issues**: Contact your domain registrar
- **Performance**: Use Lighthouse for diagnostics

## 🎉 Success!

Once deployed, your TILSF microsite will be:
- ✅ Live at `https://tilsf.com`
- ✅ Optimized for performance
- ✅ SEO-friendly
- ✅ Mobile-responsive
- ✅ Analytics-enabled
- ✅ Security-hardened

**Expected load time**: < 1 second  
**Lighthouse score**: 95+ across all metrics  
**SEO ready**: Fully optimized for search engines

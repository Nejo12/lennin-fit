# 🚀 TILSF Microsite - Live at tilsf.com

A high-performance, SEO-optimized static microsite for the TILSF framework, built with modern web standards and deployed to Netlify.

## ⚡ Quick Deploy

```bash
# Build and deploy to Netlify (one command)
npm run deploy:tilsf:netlify

# Or build only
npm run build:tilsf
```

## 🎯 What is TILSF?

**TILSF** = **T**asks, **I**nvoices, **L**eads, **S**chedule, **F**ocus

The five pillars freelancers need to build a successful business. This microsite explains the framework and drives traffic to [Lennin](https://lennin.fit) - the complete TILSF implementation.

## 🏗️ Architecture

### Static Site Generation

- **Single HTML file** with critical CSS inlined
- **No JavaScript dependencies** (except analytics)
- **Optimized for speed** (< 1s load time)
- **SEO-first** design with proper meta tags

### Performance Features

- ✅ **Critical CSS inlined** (~11KB)
- ✅ **System fonts** for fast loading
- ✅ **Optimized images** (WebP when possible)
- ✅ **Preconnect hints** for external resources
- ✅ **Security headers** configured
- ✅ **Caching strategies** implemented

### SEO Optimization

- ✅ **Semantic HTML** structure
- ✅ **Open Graph** and **Twitter Cards**
- ✅ **Structured data** ready
- ✅ **Sitemap.xml** generated
- ✅ **Robots.txt** optimized
- ✅ **Canonical URLs** set

## 📁 File Structure

```
dist-tilsf/                    # Built microsite
├── index.html                # Main TILSF page
├── favicon.svg              # Site icon
├── og.jpg                   # Open Graph image
├── robots.txt               # Search engine config
├── sitemap.xml              # Site structure
├── 404.html                 # Error page
├── _redirects               # Netlify redirects
└── _headers                 # Security headers

public/                      # Source files
├── tilsf.html              # Source HTML
├── favicon.svg             # Source icon
├── og.jpg                  # Source OG image
└── ...

scripts/
├── build-tilsf.js          # Build script
└── deploy-tilsf.sh         # Deployment script
```

## 🚀 Deployment Options

### 1. Netlify CLI (Recommended)

```bash
npm run deploy:tilsf:netlify
```

### 2. Netlify Dashboard

1. Build: `npm run build:tilsf`
2. Drag `dist-tilsf` to Netlify
3. Configure custom domain

### 3. GitHub Actions

```yaml
- run: npm run build:tilsf
- uses: nwtgck/actions-netlify@v2
  with:
    publish-dir: './dist-tilsf'
```

## 🔧 Configuration

### Domain Setup

1. **Add domain in Netlify**: `tilsf.com`
2. **Configure DNS**:
   ```
   A    @    75.2.60.5
   CNAME www your-site.netlify.app
   ```
3. **SSL certificate** auto-provisioned

### Analytics

- **Plausible Analytics** configured
- **UTM tracking** on all CTAs
- **Privacy-focused** analytics

### Security

- **HTTPS enforced**
- **Security headers** configured
- **Content Security Policy** ready
- **XSS protection** enabled

## 📊 Performance Metrics

### Expected Scores

- **Lighthouse Performance**: 95-100
- **Lighthouse Accessibility**: 95-100
- **Lighthouse Best Practices**: 95-100
- **Lighthouse SEO**: 95-100

### Load Times

- **First Contentful Paint**: < 0.5s
- **Largest Contentful Paint**: < 1s
- **Cumulative Layout Shift**: 0
- **First Input Delay**: < 100ms

## 🎨 Design System

### Colors

- **Primary**: `#65d46e` (Brand green)
- **Background**: `#0b0b0b` (Dark)
- **Text**: `#e7e7ea` (Light)
- **Muted**: `#b5b6bc` (Gray)

### Typography

- **System fonts** for performance
- **Fluid typography** with clamp()
- **Responsive scaling** across devices

### Components

- **Hero section** with gradient text
- **Framework cards** with hover effects
- **CTA sections** with clear hierarchy
- **Footer** with branding

## 🔄 Development

### Local Development

```bash
# Build and serve locally
npm run build:tilsf
cd dist-tilsf
python -m http.server 8000
```

### Making Changes

1. Edit `public/tilsf.html`
2. Run `npm run build:tilsf`
3. Test locally
4. Deploy with `npm run deploy:tilsf:netlify`

### Content Updates

- **Hero text**: Update in `public/tilsf.html`
- **Framework descriptions**: Modify card content
- **CTAs**: Update links and UTM parameters
- **Meta tags**: Edit SEO information

## 📈 Analytics & Tracking

### UTM Parameters

- **Hero CTA**: `utm_campaign=hero_cta`
- **Section CTA**: `utm_campaign=cta_section`
- **NoScript fallback**: `utm_campaign=noscript`

### Conversion Tracking

- **Plausible Analytics** for page views
- **UTM tracking** for traffic sources
- **Goal tracking** ready for setup

## 🐛 Troubleshooting

### Common Issues

**Build fails:**

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and rebuild
npm run clean
npm run build:tilsf
```

**Domain not working:**

```bash
# Check DNS propagation
dig tilsf.com
nslookup tilsf.com

# Verify Netlify configuration
netlify status
```

**Performance issues:**

- Run Lighthouse audit
- Check image optimization
- Verify critical CSS is inlined

## 📚 Resources

- **Deployment Guide**: `TILSF_DEPLOYMENT.md`
- **Netlify Docs**: https://docs.netlify.com/
- **Lighthouse**: https://pagespeed.web.dev/
- **DNS Checker**: https://dnschecker.org/

## 🎉 Success Metrics

Once deployed, you'll have:

- ✅ **Live at tilsf.com**
- ✅ **< 1s load time**
- ✅ **95+ Lighthouse scores**
- ✅ **SEO optimized**
- ✅ **Mobile responsive**
- ✅ **Analytics enabled**
- ✅ **Security hardened**

---

**Built with ❤️ for freelancers**  
**Powered by [Lennin](https://lennin.fit)**

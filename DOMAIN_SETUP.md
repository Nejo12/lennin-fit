# Domain Setup Guide for Lennin Fit

This guide makes domain management much easier and more maintainable.

## 🏗️ Project Structure

```
lennin-fit/
├── netlify.toml          # Netlify configuration
├── scripts/deploy.sh     # Easy deployment script
├── DOMAIN_SETUP.md       # This guide
└── src/                  # Application code
```

## 🌐 Domain Strategy

### Primary Domains

- **Main Site**: `https://lennin.fit`
- **Brand Domain**: `https://tilsf.com`

### Redirects

- `www.lennin.fit` → `lennin.fit`
- `www.tilsf.com` → `tilsf.com`

## 🚀 Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
./scripts/deploy.sh
```

### Option 2: Manual Deployment

```bash
npm run build
git add .
git commit -m "Your commit message"
git push origin main
```

## 🔧 Domain Management

### Adding a New Domain

1. **In Netlify Dashboard**:
   - Go to Domain Management
   - Click "Add domain alias"
   - Enter your domain

2. **Update DNS** (if external registrar):
   - Point nameservers to Netlify's DNS servers
   - Or add A/CNAME records pointing to Netlify

3. **Update Configuration** (if needed):
   - Add redirects to `netlify.toml`
   - Update Supabase authentication settings

### Removing a Domain

1. **In Netlify Dashboard**:
   - Go to Domain Management
   - Click "Options" on the domain
   - Select "Remove domain"

2. **Clean up DNS** (if external registrar):
   - Remove A/CNAME records
   - Or change nameservers back

## 🔐 Authentication Setup

### Supabase Configuration

1. **Site URL**: `https://tilsf.com`
2. **Redirect URLs**:
   - `https://tilsf.com`
   - `https://tilsf.com/verify`
   - `https://tilsf.com/auth/callback`
   - `https://lennin.fit` (backup)
   - `https://lennin.fit/verify` (backup)

### Environment Variables

```bash
VITE_APP_URL=https://tilsf.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 🛠️ Troubleshooting

### Domain Not Working

1. **Check DNS propagation**: `dig A yourdomain.com`
2. **Verify Netlify status**: Check domain management dashboard
3. **Check SSL certificate**: Should be automatic with Let's Encrypt
4. **Test redirects**: `curl -I https://yourdomain.com`

### Build Failures

1. **Check logs**: Netlify dashboard → Deploys
2. **Test locally**: `npm run build`
3. **Check dependencies**: `npm install`

### Authentication Issues

1. **Verify Supabase settings**: Check URL configuration
2. **Test redirect URLs**: Ensure they match exactly
3. **Check environment variables**: Verify VITE_APP_URL

## 📋 Maintenance Checklist

### Weekly

- [ ] Check deployment status
- [ ] Monitor domain health
- [ ] Review error logs

### Monthly

- [ ] Update dependencies
- [ ] Review SSL certificates
- [ ] Check domain renewals

### Quarterly

- [ ] Review domain strategy
- [ ] Update documentation
- [ ] Security audit

## 🆘 Emergency Procedures

### Site Down

1. **Check Netlify status**: https://status.netlify.com
2. **Verify DNS**: `dig A yourdomain.com`
3. **Check deployment**: Netlify dashboard
4. **Rollback if needed**: Previous deployment

### Domain Issues

1. **Check registrar**: Domain renewal status
2. **Verify DNS**: Nameserver configuration
3. **Contact support**: If DNS issues persist

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.ssllabs.com/ssltest/

---

**Remember**: Always test changes in a staging environment before deploying to production!

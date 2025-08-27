# TILSF Conversion Test Strategy

## 🎯 Goal
Test if TILSF.com sends converting traffic to Lennin.fit. If it does, keep it. If not, redirect permanently.

## 📊 Current Setup

### **Live Site**: https://tilsf.com
- **Single page** with TILSF framework explanation
- **Two CTAs** with UTM tracking:
  - Hero: `utm_campaign=hero_cta`
  - Bottom: `utm_campaign=bottom_cta`
- **Analytics**: Plausible tracking on tilsf.com
- **SEO**: Fully optimized for search engines

### **Tracking Parameters**
All CTAs include:
- `utm_source=tilsf`
- `utm_medium=website`
- `utm_campaign=hero_cta` or `utm_campaign=bottom_cta`

## 📈 How to Measure Success

### **In Plausible Analytics (tilsf.com)**
- Track page views and unique visitors
- Monitor click-through rates on CTAs
- Check referrer traffic sources

### **In Lennin Analytics**
- Filter by `utm_source=tilsf`
- Track conversion rates from TILSF traffic
- Monitor sign-ups and trial starts

### **Key Metrics to Watch**
1. **Traffic Volume**: How much traffic does TILSF generate?
2. **Click Rate**: What % of visitors click CTAs?
3. **Conversion Rate**: What % of TILSF visitors sign up?
4. **Quality**: Do TILSF visitors have higher LTV?

## ⏱️ Testing Timeline
- **Test Period**: 30-60 days
- **Minimum Traffic**: 100+ unique visitors
- **Decision Point**: Based on conversion data

## 🔄 If Test Fails (Low Conversion)

### **Quick Redirect Command**
```bash
npm run redirect:tilsf:deploy
```

This will:
- ✅ Create 301 redirect from tilsf.com → lennin.fit
- ✅ Update robots.txt to disallow crawling
- ✅ Update sitemap to point to lennin.fit
- ✅ Deploy the redirect immediately

### **What Happens**
- All tilsf.com traffic permanently redirected to lennin.fit
- SEO value transferred to main domain
- No more maintenance needed

## 🎉 If Test Succeeds (Good Conversion)

### **Keep TILSF Live**
- Continue monitoring performance
- Optimize content based on data
- Consider expanding TILSF content

### **Optimization Opportunities**
- A/B test different CTAs
- Add more TILSF framework content
- Create TILSF-specific landing pages

## 📋 Quick Commands

```bash
# Build TILSF microsite
npm run build:tilsf

# Deploy TILSF to production
npm run deploy:tilsf:netlify

# Check current site
curl -I https://tilsf.com

# Redirect to lennin.fit (if test fails)
npm run redirect:tilsf:deploy
```

## 🎯 Success Criteria
- **Conversion Rate**: >2% of TILSF visitors sign up
- **Traffic Volume**: >50 unique visitors/month
- **Quality**: TILSF visitors show higher engagement than average

## 📞 Decision Framework
- **Keep if**: Good conversion rate + decent traffic volume
- **Redirect if**: Low conversion OR very low traffic after 60 days
- **Optimize if**: Good traffic but poor conversion (A/B test)

---

**Remember**: This is a data-driven decision. Let the numbers guide you! 📊

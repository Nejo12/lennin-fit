#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILSF_DIR = path.join(__dirname, '../dist-tilsf');
const PUBLIC_DIR = path.join(__dirname, '../public');

console.log('🚀 Building TILSF microsite...');

// Create dist-tilsf directory
if (!fs.existsSync(TILSF_DIR)) {
  fs.mkdirSync(TILSF_DIR, { recursive: true });
}

// Copy TILSF HTML
const tilsfHtml = path.join(PUBLIC_DIR, 'tilsf.html');
const tilsfHtmlDest = path.join(TILSF_DIR, 'index.html');

if (fs.existsSync(tilsfHtml)) {
  fs.copyFileSync(tilsfHtml, tilsfHtmlDest);
  console.log('✅ Copied tilsf.html to index.html');
} else {
  console.error('❌ tilsf.html not found in public directory');
  process.exit(1);
}

// Copy essential assets
const assetsToCopy = [
  'favicon.svg',
  'og.jpg',
  'robots.txt',
  'sitemap.xml',
  '404.html',
];

assetsToCopy.forEach(asset => {
  const source = path.join(PUBLIC_DIR, asset);
  const dest = path.join(TILSF_DIR, asset);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied ${asset}`);
  } else {
    console.warn(`⚠️  ${asset} not found, skipping...`);
  }
});

// Create optimized robots.txt for TILSF
const robotsContent = `User-agent: *
Allow: /

Sitemap: https://tilsf.com/sitemap.xml

# TILSF microsite - allow all crawlers
`;

fs.writeFileSync(path.join(TILSF_DIR, 'robots.txt'), robotsContent);
console.log('✅ Created optimized robots.txt');

// Create optimized sitemap.xml for TILSF
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tilsf.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(TILSF_DIR, 'sitemap.xml'), sitemapContent);
console.log('✅ Created optimized sitemap.xml');

// Create _redirects file for Netlify (redirects only, no headers)
const redirectsContent = `# TILSF microsite redirects

# Force HTTPS
http://tilsf.com/* https://tilsf.com/:splat 301!
http://www.tilsf.com/* https://tilsf.com/:splat 301!

# Redirect www to apex
https://www.tilsf.com/* https://tilsf.com/:splat 301!

# Handle 404
/* /404.html 404
`;

fs.writeFileSync(path.join(TILSF_DIR, '_redirects'), redirectsContent);
console.log('✅ Created _redirects file');

// Create _headers file for additional security
const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-XSS-Protection: 1; mode=block
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/*.xml
  Cache-Control: public, max-age=86400

/robots.txt
  Cache-Control: public, max-age=86400
`;

fs.writeFileSync(path.join(TILSF_DIR, '_headers'), headersContent);
console.log('✅ Created _headers file');

// Copy Netlify configuration
const netlifyConfig = path.join(__dirname, '../dist-tilsf/netlify.toml');
if (fs.existsSync(netlifyConfig)) {
  fs.copyFileSync(netlifyConfig, path.join(TILSF_DIR, 'netlify.toml'));
  console.log('✅ Copied netlify.toml configuration');
} else {
  console.warn('⚠️  netlify.toml not found, creating basic config...');

  const basicNetlifyConfig = `[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

  fs.writeFileSync(path.join(TILSF_DIR, 'netlify.toml'), basicNetlifyConfig);
  console.log('✅ Created basic netlify.toml');
}

console.log('\n🎉 TILSF microsite built successfully!');
console.log(`📁 Output directory: ${TILSF_DIR}`);
console.log('\n📋 Files created:');
console.log('  - index.html (optimized TILSF page)');
console.log('  - favicon.svg');
console.log('  - og.jpg');
console.log('  - robots.txt (optimized)');
console.log('  - sitemap.xml (optimized)');
console.log('  - 404.html');
console.log('  - _redirects (Netlify config)');
console.log('  - _headers (security headers)');
console.log('  - netlify.toml (Netlify config)');

console.log('\n🚀 Ready to deploy to tilsf.com!');
console.log('💡 Deploy this directory to Netlify with custom domain tilsf.com');

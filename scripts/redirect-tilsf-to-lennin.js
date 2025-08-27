#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILSF_DIR = path.join(__dirname, '../dist-tilsf');

console.log('🔄 Creating 301 redirect from tilsf.com to lennin.fit...');

// Create a simple redirect page
const redirectHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to Lennin...</title>
    <meta http-equiv="refresh" content="0; url=https://lennin.fit">
    <link rel="canonical" href="https://lennin.fit">
    
    <!-- SEO -->
    <meta name="description" content="Redirecting to Lennin - The all-in-one freelancer platform">
    <meta property="og:title" content="Lennin - All-in-One Freelancer Platform">
    <meta property="og:description" content="Tasks, Invoices, Leads, Schedule, Focus - All in one app">
    <meta property="og:url" content="https://lennin.fit">
    <meta property="og:type" content="website">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 40px 20px;
            background: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .redirect-link {
            color: #007bff;
            text-decoration: none;
            font-weight: 600;
        }
        .redirect-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Redirecting to Lennin...</h1>
        <p>If you're not redirected automatically, <a href="https://lennin.fit" class="redirect-link">click here</a>.</p>
    </div>
</body>
</html>`;

// Update the index.html with redirect
fs.writeFileSync(path.join(TILSF_DIR, 'index.html'), redirectHTML);

// Update _redirects to force 301 redirect
const redirectsContent = `# Permanent redirect to Lennin
/* https://lennin.fit 301!
`;

fs.writeFileSync(path.join(TILSF_DIR, '_redirects'), redirectsContent);

// Update robots.txt to disallow crawling
const robotsContent = `User-agent: *
Disallow: /

# Site has moved to lennin.fit
`;

fs.writeFileSync(path.join(TILSF_DIR, 'robots.txt'), robotsContent);

// Update sitemap to point to lennin.fit
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://lennin.fit</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(TILSF_DIR, 'sitemap.xml'), sitemapContent);

console.log('✅ Redirect files created!');
console.log('📁 Files updated:');
console.log('  - index.html (redirect page)');
console.log('  - _redirects (301 redirect)');
console.log('  - robots.txt (disallow crawling)');
console.log('  - sitemap.xml (points to lennin.fit)');

console.log('\n🚀 Deploy with: cd dist-tilsf && netlify deploy --prod');
console.log('💡 This will permanently redirect tilsf.com → lennin.fit');

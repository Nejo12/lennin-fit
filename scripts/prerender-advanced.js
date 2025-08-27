#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes to prerender with their expected content
const routes = [
  { path: '/', title: 'TILSF — Tasks, Invoices, Leads, Focus, Schedule' },
  { path: '/privacy', title: 'Privacy Policy' },
  { path: '/terms', title: 'Terms of Service' },
  { path: '/success', title: 'Success' },
];

// Start a local server to serve the built app
function startServer() {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      const indexPath = resolve(__dirname, '../dist/index.html');
      const html = readFileSync(indexPath, 'utf-8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });

    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

// Render a route using Puppeteer
async function renderRoute(browser, port, route) {
  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1200, height: 800 });

  // Navigate to the route
  await page.goto(`http://localhost:${port}${route.path}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait for React to hydrate
  await page.waitForTimeout(2000);

  // Get the rendered HTML
  const html = await page.content();

  await page.close();
  return html;
}

// Main prerendering function
async function prerender() {
  console.log('🚀 Starting advanced prerendering with Puppeteer...');

  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('🌐 Browser launched');

    // Start local server
    const { server, port } = await startServer();
    console.log(`📡 Server running on port ${port}`);

    // Create output directory
    const outputDir = resolve(__dirname, '../dist');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Prerender each route
    for (const route of routes) {
      console.log(`📄 Prerendering ${route.path}...`);

      const html = await renderRoute(browser, port, route);

      // Create filename
      let filename =
        route.path === '/' ? 'index.html' : `${route.path.slice(1)}.html`;
      if (route.path.endsWith('/')) {
        filename = `${route.path.slice(1, -1)}/index.html`;
      }

      // Ensure directory exists
      const filePath = resolve(outputDir, filename);
      const fileDir = dirname(filePath);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }

      // Write prerendered HTML
      writeFileSync(filePath, html);
      console.log(`✅ Written: ${filename}`);
    }

    // Close server and browser
    server.close();
    await browser.close();
    console.log('🎉 Advanced prerendering complete!');
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Run prerendering
prerender();

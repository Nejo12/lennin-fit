#!/usr/bin/env node

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes to prerender
const routes = ['/', '/privacy', '/terms', '/success'];

// Start a local server to render the app
function startServer() {
  return new Promise(resolveServer => {
    const server = createServer((req, res) => {
      // Serve the built index.html for all routes
      const indexPath = resolve(__dirname, '../dist/index.html');
      const html = readFileSync(indexPath, 'utf-8');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });

    server.listen(0, () => {
      const port = server.address().port;
      resolveServer({ server, port });
    });
  });
}

// Fetch and render a route
async function renderRoute(port, route) {
  const response = await fetch(`http://localhost:${port}${route}`);
  const html = await response.text();
  return html;
}

// Main prerendering function
async function prerender() {
  console.log('🚀 Starting prerendering...');

  try {
    // Start local server
    const { server, port } = await startServer();
    console.log(`📡 Server running on port ${port}`);

    // Create output directory
    const outputDir = resolve(__dirname, '../dist');
    console.log(`📁 Output directory: ${outputDir}`);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Prerender each route
    for (const route of routes) {
      console.log(`📄 Prerendering ${route}...`);

      const html = await renderRoute(port, route);

      // Create filename
      let filename = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
      if (route.endsWith('/')) {
        filename = `${route.slice(1, -1)}/index.html`;
      }

      // Ensure directory exists
      const filePath = join(outputDir, filename);
      const fileDir = dirname(filePath);
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }

      // Write prerendered HTML
      console.log(`📝 Writing to: ${filePath}`);
      writeFileSync(filePath, html);
      console.log(`✅ Written: ${filename}`);
    }

    // Close server
    server.close();
    console.log('🎉 Prerendering complete!');
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    process.exit(1);
  }
}

// Run prerendering
prerender();

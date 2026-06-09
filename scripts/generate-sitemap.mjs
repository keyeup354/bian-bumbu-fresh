import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = "https://bian-bumbu.lovable.app";

function loadEnv() {
  try {
    const envContent = readFileSync(resolve('.env'), 'utf-8');
    const env = {};
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*["']?([^"'\n]+)["']?\s*$/);
      if (match) env[match[1]] = match[2];
    }
    return env;
  } catch {
    return {};
  }
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const entries = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/products", changefreq: "daily", priority: "0.9" },
  ];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products, error } = await supabase.from('products').select('id');
      if (!error && products) {
        for (const product of products) {
          entries.push({ path: `/product/${product.id}`, changefreq: "weekly", priority: "0.8" });
        }
      }
    } catch (e) {
      console.warn('Could not fetch products for sitemap:', e.message);
    }
  }

  const urls = entries.map((e) => {
    const parts = [`  <url>`, `    <loc>${BASE_URL}${e.path}</loc>`];
    if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
    if (e.priority) parts.push(`    <priority>${e.priority}</priority>`);
    parts.push(`  </url>`);
    return parts.join('\n');
  });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join('\n');

  writeFileSync(resolve('public/sitemap.xml'), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

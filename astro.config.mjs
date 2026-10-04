import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
});

import { defineConfig } from 'astro/config';
import process from 'node:process';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  devToolbar: { enabled: false },
});

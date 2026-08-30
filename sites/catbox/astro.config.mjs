// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const pkg = (/** @type {string} */ name) => fileURLToPath(new URL(`../../packages/${name}`, import.meta.url));

// Site catbox — deploy thành project Cloudflare Pages riêng, domain riêng.
// Đổi `site` khi khách chốt domain thật (TECH_STACK_v2 §13.5).
export default defineConfig({
  site: 'https://catbox.vn',
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') }),
    icon(),
  ],
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@ui': pkg('ui'),
        '@config': pkg('config'),
        '@tokens': pkg('tokens'),
      },
    },
  },
  image: { responsiveStyles: true },
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});

// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const pkg = (/** @type {string} */ name) => fileURLToPath(new URL(`../../packages/${name}`, import.meta.url));

// Keystatic cần server-side code (route /keystatic + /api/keystatic) — không
// tương thích với output:'static' (xem plans/01-keystatic-cms-integration.md
// Task 0.4 và templates chính thức Thinkmill/keystatic templates/astro, đều
// bắt buộc output:'server' + adapter). Chỉ bật khi KEYSTATIC_ADMIN=true —
// tức lúc chạy `KEYSTATIC_ADMIN=true pnpm dev` để sửa content cục bộ. Build
// production (Cloudflare Pages, biến này không set) giữ nguyên output:'static'
// mặc định, không đổi — route /keystatic hoàn toàn không có trong bundle deploy.
const withAdmin = process.env.KEYSTATIC_ADMIN === 'true';

// Site cfc — deploy thành project Cloudflare Pages riêng, domain riêng.
// Đổi `site` khi khách chốt domain thật (TECH_STACK_v2 §13.5).
export default defineConfig({
  site: 'https://cfc.vn',
  ...(withAdmin ? { output: 'server', adapter: node({ mode: 'standalone' }) } : {}),
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') }),
    icon(),
    ...(withAdmin ? [react(), keystatic()] : []),
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
  // @keystatic/astro đọc astro:env/server dù storage.kind = 'cloud' (không dùng
  // GitHub mode) — khai báo tối thiểu để module resolve được, giá trị để trống.
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});

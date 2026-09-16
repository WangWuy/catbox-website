// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const pkg = (/** @type {string} */ name) => fileURLToPath(new URL(`../../packages/${name}`, import.meta.url));

/**
 * Keystatic cần server-side code (route /keystatic + /api/keystatic) — không
 * tương thích với output:'static'. Nên site có HAI kiểu build từ cùng một
 * codebase:
 *
 * - `pnpm build` (mặc định, KEYSTATIC_ADMIN không set) → output:'static',
 *   không có route admin. Đây là bản deploy lên Cloudflare Pages cho khách
 *   truy cập. Không đổi gì so với trước.
 * - `KEYSTATIC_ADMIN=cloudflare pnpm build` → output:'server' + adapter
 *   Cloudflare, deploy thành Worker riêng ở admin.cfc.vn ("Cách B" trong
 *   plans/01-keystatic-cms-integration.md Task 0.4). Khách vào bằng URL,
 *   không phải cài Node hay chạy lệnh.
 * - `KEYSTATIC_ADMIN=node pnpm dev` → chạy admin cục bộ bằng adapter Node,
 *   tiện khi dev không muốn đụng tới Cloudflare.
 *
 * Ghi chú về lỗi Cloudflare từng nêu trong plan (issue #1497 — OAuth state
 * sinh sai trên workerd): đã kiểm chứng lại trên bản đang cài
 * (@keystatic/core 0.6.9), package ship sẵn build riêng cho Workers qua
 * export condition "worker" — file dist/keystatic-core-api-generic.worker.js
 * không import `node:*` nào và dùng thẳng Web Crypto toàn cục
 * (`crypto.getRandomValues`) để sinh OAuth state. Lỗi cũ không còn áp dụng.
 */
const adminMode = process.env.KEYSTATIC_ADMIN;
const withAdmin = adminMode === 'true' || adminMode === 'node' || adminMode === 'cloudflare';

const adminAdapter = () =>
  adminMode === 'cloudflare'
    ? cloudflare({ imageService: 'passthrough' })
    : node({ mode: 'standalone' });

const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  (process.env.CF_PAGES_URL ? process.env.CF_PAGES_URL : null) ||
  'https://cfc.vn';

// Site cfc — deploy thành project Cloudflare Pages riêng, domain riêng.
// Đổi `site` khi khách chốt domain thật (TECH_STACK_v2 §13.5).
export default defineConfig({
  site: siteUrl,
  ...(withAdmin ? { output: 'server', adapter: adminAdapter() } : {}),
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
  devToolbar: { enabled: false },
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

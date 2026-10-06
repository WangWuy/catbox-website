# ==============================================================================
# Multi-stage Dockerfile cho Catbox Ecosystem Monorepo (CFC / Catbox / Tetta)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. BUILDER STAGE
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Cài đặt pnpm phiên bản khớp với packageManager của repo (10.34.5)
RUN npm install -g pnpm@10.34.5

# Copy cấu hình workspace và package manifests trước để tối ưu Docker layer cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY packages/config/package.json ./packages/config/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/ui/package.json ./packages/ui/
COPY sites/catbox/package.json ./sites/catbox/
COPY sites/cfc/package.json ./sites/cfc/
COPY sites/tetta/package.json ./sites/tetta/
COPY workers/quote-handler/package.json ./workers/quote-handler/

# Cài đặt dependencies với frozen lockfile và hoist các package dùng chung (tailwindcss...)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy toàn bộ source code
COPY packages/ ./packages/
COPY sites/ ./sites/
COPY scripts/ ./scripts/

# Biến build: SITE (cfc | catbox | tetta, mặc định: cfc)
ARG SITE=cfc
ENV SITE=${SITE}

# Tùy chọn mode Keystatic admin (để trống cho static SSG, hoặc 'node' cho SSR)
ARG KEYSTATIC_ADMIN=""
ENV KEYSTATIC_ADMIN=${KEYSTATIC_ADMIN}

# 1. Sinh các ảnh placeholder & OG mặc định
# 2. Build site chỉ định bằng Astro và tạo chỉ mục tìm kiếm Pagefind
RUN pnpm gen:placeholder && \
    pnpm --filter @catbox/site-${SITE} build

# ------------------------------------------------------------------------------
# 2. PRODUCTION SSR / ADMIN RUNNER (Tùy chọn - Node.js)
# Sử dụng khi cần chạy admin Keystatic SSR trên máy chủ
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner-ssr

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

ARG SITE=cfc
COPY --from=builder /app/sites/${SITE}/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/sites/${SITE}/node_modules ./sites/${SITE}/node_modules

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]

# ------------------------------------------------------------------------------
# 3. PRODUCTION STATIC RUNNER (Mặc định - Nginx Alpine)
# Phục vụ website tĩnh với hiệu năng cao, siêu nhẹ (~25MB), kèm Pagefind & Gzip
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner-static

ARG SITE=cfc
ENV SITE=${SITE}

# Cấu hình Nginx tối ưu cho Astro
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bản build tĩnh từ builder stage
COPY --from=builder /app/sites/${SITE}/dist /usr/share/nginx/html

EXPOSE 80

# Health check kiểm tra endpoint /healthz
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]


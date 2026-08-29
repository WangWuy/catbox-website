# Hướng dẫn phát triển — Catbox Ecosystem

Monorepo PNPM chứa **3 website độc lập trên 3 domain riêng**, dùng chung một bộ
component và một hệ token màu.

## Vì sao 1 repo cho 3 domain?

3 site chia sẻ ~90% layout (Topbar Switcher, Header, CategoryNav, Footer,
Ecosystem block, toàn bộ SEO). Tách 3 repo nghĩa là mỗi lần sửa Footer phải sửa
3 lần × 12 template. Gom chung thì sửa 1 lần, cả 3 site nhận.

Deploy vẫn hoàn toàn tách biệt: mỗi site là một project Cloudflare Pages riêng,
domain riêng, build riêng, không site nào phụ thuộc site nào lúc chạy.

```
catbox-ecosystem/
├── packages/
│   ├── tokens/     3 file CSS theme + base DNA dùng chung
│   ├── config/     brands.ts (nguồn sự thật), schema.ts (Zod), nav.ts
│   └── ui/         layout/ · home/ · catalog/ · islands/ · seo/
├── sites/
│   ├── catbox/     → catbox.vn   (Dark Luxury, neon hồng/cyan)
│   ├── tetta/      → tetta.vn    (Bordeaux/Gold, serif Playfair)
│   └── cfc/        → cfc.vn      (Cam/Kraft, Montserrat/Inter)
├── workers/quote-handler/   Cloudflare Worker: form → Telegram + Sheet
├── scripts/        gen-placeholder.mjs · check-content.mjs
└── design/         Tài nguyên thiết kế (figma, branding, mockups, reference)
    ├── catbox/     figma/ · SITEMAP_CATBOX.md
    ├── cfc/        branding/ · products/ · mockups/ · reference/
    └── tetta/      (chờ bổ sung)
```

## Chạy local

```bash
pnpm install

pnpm dev:cfc      # http://localhost:4321
pnpm dev:tetta
pnpm dev:catbox
```

Ba site chạy song song được — chỉ cần khác port (`--port 4322`).

## Build

```bash
pnpm build              # build cả 3 site song song
pnpm build:cfc          # chỉ một site
```

Mỗi lệnh build chạy `astro build` rồi `pagefind --site dist` để sinh chỉ mục
tìm kiếm. **Search chỉ hoạt động sau khi build** — trong `astro dev` ô search
sẽ rơi về trang `/search` kèm thông báo.

Xem thử bản build: `pnpm --filter @catbox/site-cfc preview`.

## Ảnh placeholder

Ảnh thật khách gửi sau, nhưng trang phải demo được ngay:

```bash
pnpm gen:placeholder    # sinh SVG gradient theo màu từng brand
```

Kết quả nằm ở `sites/<brand>/public/placeholders/` (đã gitignore — sinh lại bất
cứ lúc nào). Mọi field ảnh trong Zod schema đều `optional`, nên build vẫn xanh
khi chưa có một tấm ảnh thật nào.

## Kiểm tra nội dung trước khi push

```bash
pnpm check:content            # cảnh báo thiếu meta/ảnh, exit 0
pnpm check:content --strict   # dùng ở Pha 4: thiếu ảnh cũng fail
```

## Thêm site mới hoặc sửa thông tin brand

Mọi thứ về brand — domain, hotline, email, CTA, chứng nhận, pill khuyến mãi —
nằm ở [`packages/config/brands.ts`](packages/config/brands.ts). Sửa ở đó,
cả 3 site cập nhật theo. Menu nằm ở [`packages/config/nav.ts`](packages/config/nav.ts).

Màu sắc nằm ở `packages/tokens/<brand>.css`. Component không bao giờ hardcode
hex — luôn dùng `bg-primary`, `text-ink-muted`, `bg-primary-deep`…

## Deploy — 3 project Cloudflare Pages từ 1 repo

Tạo **3 project riêng**, mỗi project trỏ vào một thư mục:

| Project | Root directory | Build command | Output | Domain |
| :-- | :-- | :-- | :-- | :-- |
| `catbox` | `sites/catbox` | `pnpm build:catbox` | `sites/catbox/dist` | catbox.vn |
| `tetta` | `sites/tetta` | `pnpm build:tetta` | `sites/tetta/dist` | tetta.vn |
| `cfc` | `sites/cfc` | `pnpm build:cfc` | `sites/cfc/dist` | cfc.vn |

Cấu hình chung cho cả 3:

- **Build system version:** 2 trở lên
- **Environment variable:** `NODE_VERSION = 22`

Push lên nhánh chính → cả 3 project tự build. Site nào không có file thay đổi
vẫn build lại (Cloudflare không biết monorepo), mất ~40 giây mỗi site — chấp
nhận được ở quy mô này.

### Worker nhận form

```bash
cd workers/quote-handler
pnpm wrangler secret put TELEGRAM_BOT_TOKEN
pnpm wrangler secret put TELEGRAM_CHAT_ID
pnpm wrangler secret put SHEET_WEBHOOK_URL    # tuỳ chọn
pnpm wrangler deploy
```

Sau khi deploy, sửa `ALLOWED_ORIGINS` trong `wrangler.toml` cho khớp 3 domain
thật, và trỏ `formEndpoint` của `Footer.astro` / form báo giá về URL Worker.

## Tình trạng từng site

| Site | Trạng thái | Route |
| :-- | :-- | :-- |
| **CFC** | Hoàn chỉnh — 10 khối homepage, catalog + filter, blog, bảng giá sỉ, contact, policies | 23 |
| **Tetta** | Nền móng (Pha 0) — layout, theme, SEO chạy; chưa có khối homepage | 3 |
| **Catbox** | Nền móng (Pha 0) — layout, theme, SEO chạy; chưa có khối homepage | 3 |

Tetta và Catbox dùng lại toàn bộ component ở `packages/ui/home/` — dựng homepage
cho chúng chủ yếu là viết content MDX và truyền props khác, không phải code lại.

## Ảnh thật đã dùng cho CFC

Nguồn: `design/cfc/branding/banner.png`, `design/cfc/branding/logo.png`, `design/cfc/products/*.png` → copy vào
`sites/cfc/src/assets/`. Astro tự nén: banner 1989 KB → **59 KB WebP**.

Ảnh khai trong MDX là chuỗi tương đối với `src/assets/`
(ví dụ `image: products/tui-giay.png`), component `SmartImage` tự quyết định:

- ảnh có trong `src/assets` → `<Image>` của `astro:assets` (WebP/AVIF + srcset)
- ảnh trong `public/` hoặc URL ngoài → `<img>` thường
- không có gì → placeholder SVG theo màu brand

## Những gì còn chờ khách chốt

Các chỗ đánh dấu `TODO` trong `brands.ts`:

- 3 domain thật (hiện tạm dùng `catbox.vn` / `tetta.vn` / `cfc.vn`)
- Hotline từng brand (hiện là `0988.xxx.xxx` / `0909.xxx.xxx`)
- Link mạng xã hội (hiện là `#`)
- Logo gốc AI/SVG — hiện dùng wordmark chữ, thay bằng `<img>` trong
  `packages/ui/layout/BrandLogo.astro`, giữ nguyên kích thước hộp để CLS = 0
- Ảnh OG raster 1200×630 (hiện là SVG placeholder — Facebook/Zalo không render SVG)

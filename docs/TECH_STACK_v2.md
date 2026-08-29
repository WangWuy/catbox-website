# 🔍 ĐÁNH GIÁ TECH STACK v2 — Hệ sinh thái 3 Website Catbox – Tetta – CFC

> **Phiên bản:** 2.0
> **Ngày:** 29/08/2026
> **Thay thế cho:** [`ĐÁNH GIÁ TECH STACK.md`](./ĐÁNH%20GIÁ%20TECH%20STACK.md) (giữ nguyên làm bản lưu)
> **Scope:** **Làm đầy đủ tính năng** theo đúng [`REQUIREMENTS.md`](./REQUIREMENTS.md), [`TETTA_CFC_DESIGN_SPEC.md`](./TETTA_CFC_DESIGN_SPEC.md) và [`SITEMAP_CATBOX.md`](../catbox/SITEMAP_CATBOX.md) — không cắt tính năng để rút ngắn timeline.
> **Ràng buộc:** Ảnh/video sản phẩm khách cung cấp **sau** → kiến trúc phải chạy được và deploy được **trước khi có ảnh thật**.

---

## 0. Vì sao cần bản v2?

Bản v1 đúng về **kết luận** (Astro + Tailwind + Cloudflare) nhưng sai về **quy mô đầu vào**. Sau khi đối chiếu lại 3 tài liệu đặc tả, có 5 khác biệt buộc phải cập nhật:

| # | Bản v1 giả định | Thực tế theo đặc tả | Ảnh hưởng |
| :---: | :--- | :--- | :--- |
| 1 | "~10–12 trang unique" | **12 route templates × 3 site**, gồm cả `[slug]` động cho products / industry / case-studies / blog / policies | Khối lượng gấp ~2.5× |
| 2 | "Không có tương tác phức tạp" | Search, filter catalog, tabs bestseller, swatches, **hotspot ảnh**, video player, đa ngôn ngữ, newsletter, nút Đăng nhập/Đăng ký | Cần chiến lược Island rõ ràng, không còn "0 KB JS" tuyệt đối |
| 3 | Timeline 7 ngày | Scope đầy đủ tính năng | **Không khả thi trong 7 ngày** — xem §7 |
| 4 | Đường dẫn assets cũ | `assets/figma_design/` → **`assets/figma_design_catbox/`**; `thaiduong_design/` nay nằm trong **`cfc/`**; `assets/mockups/` **đang rỗng** | Docs cũ link chết; cần chuẩn hoá lại |
| 5 | Ảnh có sẵn | **Ảnh/video khách gửi sau** | Cần lớp placeholder + content schema chịu được ảnh thiếu |

> [!IMPORTANT]
> **Mâu thuẫn cần khách chốt:** [`CONSULTING_SCRIPT.md`](./CONSULTING_SCRIPT.md) mô tả **Tetta = xưởng ly giấy** (tone Xanh Eco/Cam) và **CFC = bao bì thực phẩm** (tone Navy/Đỏ). Trong khi [`REQUIREMENTS.md`](./REQUIREMENTS.md) + [`TETTA_CFC_DESIGN_SPEC.md`](./TETTA_CFC_DESIGN_SPEC.md) mô tả **Tetta = hộp quà Tết** (Bordeaux/Gold) và **CFC = bao bánh mì** (Cam/Kraft).
> **Tài liệu này đi theo REQUIREMENTS + DESIGN_SPEC** (bản mới hơn, chi tiết hơn, có bảng màu Hex đầy đủ). Cần khách xác nhận trước khi viết nội dung.

---

## 1. Bản chất dự án (đánh giá lại)

| Yếu tố | Thực tế |
| :--- | :--- |
| **Loại website** | Catalog / Lead Generation nâng cao — có filter + search + form phân loại, **không** có checkout, **không** có tài khoản người dùng thật |
| **Mức tương tác** | Trung bình. Khoảng **8 khối cần JS**, phần còn lại tĩnh hoàn toàn |
| **Ai cập nhật nội dung** | Bạn (developer), qua file MDX + `git push` — chạy luôn gói SEO/GEO hàng tháng |
| **Số route template** | **12 template × 3 site** (Catbox có thêm Industry, Tetta/CFC có thêm Category F&B/Quà tặng) |
| **Nội dung ban đầu** | Text: viết được ngay. **Ảnh/video: chờ khách** → build với placeholder |
| **Hiệu ứng đặc biệt** | Catbox: Text Masking, Glow neon, hover typography, hero 3D shelf. Tetta/CFC: hotspot ảnh, video dome, carousel |

> [!NOTE]
> Vì bạn tự viết MDX rồi `git push`, **vẫn không cần CMS**. Kết luận này của v1 giữ nguyên và còn đúng hơn khi scope lớn hơn — CMS chỉ thêm một hệ thống nữa phải bảo trì.

---

## 2. Quyết định stack

### ⭐ Kết luận: **Astro 5 + Tailwind CSS v4 + MDX + Cloudflare Pages**

Không đổi so với v1, nhưng **lý do đã khác**: v1 chọn Astro vì "trang tĩnh không cần JS". v2 chọn Astro vì **Islands Architecture** — thứ duy nhất cho phép có đủ 8 khối tương tác mà vẫn giữ PageSpeed 95+, thay vì hydrate toàn bộ trang như Next.js.

| Hạng mục | Lựa chọn | Lý do |
| :--- | :--- | :--- |
| **Framework** | **Astro 5** | Islands: chỉ hydrate khối cần JS. 12 template × 3 site vẫn ship < 40 KB JS/trang |
| **Styling** | **Tailwind CSS v4** | 3 theme bằng CSS Variables trên `:root[data-brand]`. Không cần build 3 lần |
| **Interactive Islands** | **Astro + vanilla TS**, dùng **Preact** (3 KB) chỉ khi cần state phức tạp | Tránh kéo React 45 KB vào site catalog |
| **Content** | **Content Collections + MDX** (type-safe qua Zod schema) | Bắt lỗi thiếu field ngay lúc build — quan trọng khi ảnh về muộn |
| **Search** | **Pagefind** (build-time index, ~30 KB, tĩnh hoàn toàn) | Không cần Algolia, không cần server, không tốn phí |
| **Animation** | **GSAP** (Catbox) + CSS-only (Tetta/CFC) | Text Masking + Glow chỉ load ở Catbox |
| **Ảnh** | **`astro:assets`** → WebP/AVIF, `width`/`height` tự động | Zero CLS, không cần tối ưu thủ công |
| **Video** | `<video>` native + poster, lazy; hoặc **Cloudflare Stream** nếu file lớn | Không nhúng YouTube (kéo 500 KB + tracker) |
| **Form** | **Cloudflare Workers → Telegram Bot + Google Sheet** | Free, có log, khách nhận lead ngay trên điện thoại |
| **Đa ngôn ngữ** | **`astro:i18n`** built-in | Topbar 5 cờ theo đặc tả (§2 DESIGN_SPEC) |
| **Deploy** | **Cloudflare Pages** × 3 domain | CDN edge VN, TTFB < 50 ms, SSL auto, **$0/tháng** |
| **SEO** | `@astrojs/sitemap` + JSON-LD component + OG image tự sinh | |
| **GEO** | `/llms.txt` + bảng so sánh structured + FAQ schema | |

### So sánh lại 4 phương án (dưới scope đầy đủ tính năng)

| Tiêu chí | ⭐ Astro 5 | Next.js 15 | Next.js + Turborepo | WordPress |
| :--- | :---: | :---: | :---: | :---: |
| JS ship về client (trang catalog) | **~15–40 KB** | 90–160 KB | 90–160 KB | 200–500 KB |
| PageSpeed mobile (thực tế, có filter+search) | **92–99** | 72–88 | 72–88 | 30–55 |
| TTFB qua CDN | **< 50 ms** | 150–350 ms | 150–350 ms | 500–1500 ms |
| Dựng đủ 8 khối tương tác | ✅ Islands | ✅ | ✅ | 🟡 Cần plugin, nặng |
| Dựng hiệu ứng Catbox (masking, glow) | ✅ GSAP island | ✅ | ✅ | ❌ Rất khó |
| Search không cần server | ✅ Pagefind | 🟡 Cần lib | 🟡 | ❌ Cần MySQL |
| Chia sẻ component giữa 3 site | ✅ PNPM workspace | ✅ | ✅ | ❌ 3 bản riêng |
| Hosting/tháng | **0đ** | 0–20 USD | 0–20 USD | 300–750K |
| Bảo mật | **Không có server** | Thấp | Thấp | Cao (target hack #1) |
| Bảo trì 3 site | 1 codebase | 1 codebase | 1 codebase (phức tạp hơn) | 3 site riêng |

**Loại Turborepo:** với 3 site + 1 package UI, PNPM workspace là đủ. Turborepo chỉ có lãi khi build time > 2 phút; ở đây Astro build cả 3 site mất ~40–60 giây.

**Loại WordPress:** không chỉ vì PageSpeed. Với scope này, dựng hotspot ảnh + text masking + 5 cột bestseller có swatches trên WP là dựng lại từ đầu bằng page-builder — chậm hơn code thẳng, và không tái sử dụng được giữa 3 site.

---

## 3. Chiến lược Islands — 8 khối cần JavaScript

Đây là phần v1 thiếu hoàn toàn. Mỗi khối dưới đây là một **island độc lập**, chỉ tải trên trang cần nó.

| # | Khối | Directive | Kỹ thuật | JS ước tính |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Search box** (Header) | `client:idle` | Pagefind UI, index sinh lúc build | ~30 KB (lazy) |
| 2 | **Catalog filter** (chất liệu / kiểu dáng / giá) | `client:visible` | Vanilla TS lọc DOM + URL query param (`?material=kraft`) → SEO-friendly, share link được | ~4 KB |
| 3 | **Bestseller tabs** (`Tất cả` / danh mục) | `client:visible` | Vanilla TS toggle `hidden` | ~1 KB |
| 4 | **Swatches** chọn màu/chất liệu | `client:visible` | Vanilla TS đổi `src` ảnh + label | ~2 KB |
| 5 | **Hotspot ảnh** (Lựa chọn của tuần) | `client:visible` | Vanilla TS + CSS popover, toạ độ % trong MDX frontmatter | ~2 KB |
| 6 | **Video player** (dome + reels xưởng) | `client:visible` | `<video>` native, `preload="none"`, poster tĩnh | ~0 KB |
| 7 | **Quote Form** (phân loại 3 tệp khách) | `client:load` | Validate + `fetch` → Worker | ~3 KB |
| 8 | **Language switcher** (5 cờ) | — | Link tĩnh `astro:i18n`, **0 JS** | 0 KB |
| — | **Catbox Text Masking + Glow** | `client:visible` | GSAP ScrollTrigger — **chỉ trên site Catbox** | ~28 KB |

**Kết quả:** trang catalog Tetta/CFC ship ~9 KB JS (chưa tính Pagefind lazy). Trang chủ Catbox ~37 KB. Cả hai đều dưới ngưỡng Core Web Vitals thoải mái.

> [!TIP]
> **Nút "👤 Đăng Nhập / Đăng Ký"** trong ảnh mẫu Thái Dương là của một site thương mại có tài khoản. Dự án này không có backend user. **Đề xuất:** giữ nguyên vị trí pill để đúng 1:1 layout, nhưng đổi thành **"👤 Nhận Báo Giá"** (Tetta) / **"👤 Bảng Giá Sỉ"** (CFC) — link tới `/contact`. Đúng thị giác, đúng mục tiêu chuyển đổi, không dựng hệ thống auth thừa. Cần khách xác nhận.

---

## 4. Xử lý việc ảnh/video về sau

Đây là ràng buộc quan trọng nhất về tiến độ. Kiến trúc phải **build xanh** khi chưa có ảnh thật.

### Nguyên tắc

1. **Content schema có `image` optional + fallback.** Zod schema trong `content.config.ts`:
   ```ts
   image: z.string().optional(),   // thiếu ảnh → dùng placeholder theo brand
   gallery: z.array(z.string()).default([]),
   ```
2. **Placeholder theo brand, không dùng ảnh stock rác.** Sinh sẵn SVG gradient + logo mờ + text quy cách theo 3 theme. Trang vẫn trông hoàn chỉnh khi demo cho khách.
3. **Mọi ảnh khai báo `width`/`height` từ đầu** → khi thay ảnh thật, layout không dịch chuyển, CLS vẫn = 0.
4. **Tách nội dung khỏi giao diện.** Ảnh chỉ được tham chiếu qua frontmatter MDX, không hardcode trong `.astro`. Thay ảnh = sửa 1 dòng text, không đụng code.
5. **Checklist bàn giao ảnh** gửi khách ngay từ ngày 1 (xem §8) — để khách chụp đúng tỉ lệ, đúng số lượng, tránh phải chụp lại.

### Ảnh cần khách cung cấp (số lượng tối thiểu)

| Loại | Catbox | Tetta | CFC | Tỉ lệ |
| :--- | :---: | :---: | :---: | :--- |
| Hero mockup 3D | 1 | 1 | 1 | 4:3, nền trong (PNG) |
| Ảnh danh mục | 5 (Industry) | 4 | 4 | 1:1 |
| Ảnh sản phẩm | 12–15 | 10–12 | 8–10 | 1:1, ≥ 1200px |
| Ảnh chi tiết/gallery | 3–5/SP | 3–5/SP | 3/SP | 1:1 |
| Case study | 6–8 bộ | 4–6 bộ | 3–4 bộ | 16:9 + 1:1 |
| Ảnh xưởng / nhân sự | 5–8 | 3–5 | 3–5 | 16:9 |
| Ảnh dọc "Vì sao chọn" | — | 1 | 1 | 3:4 |
| Ảnh lớn có hotspot | — | 1 | 1 | 1:1, ≥ 1600px |
| Video dây chuyền | 1 | 1 | 1 | MP4 H.264, ≤ 30s, ≤ 20 MB |
| Logo đối tác | 12–20 | — | — | PNG nền trong |
| Chứng nhận (ISO/HACCP/FSC) | quét | quét | quét | PNG/PDF |

> [!NOTE]
> **Video:** nếu file > 20 MB, dùng **Cloudflare Stream** (5 USD/1000 phút xem) thay vì host tĩnh, để không phá TTFB. Với lưu lượng dự kiến, chi phí thực tế gần như bằng 0.

---

## 5. Kiến trúc workspace (cập nhật đầy đủ)

```text
catbox-ecosystem/
├── packages/
│   ├── ui/                              # Shared components (Astro)
│   │   ├── layout/
│   │   │   ├── TopbarSwitcher.astro      # 3 brand + 5 cờ ngôn ngữ + hotline
│   │   │   ├── MainHeader.astro          # Logo + Search + CTA pill
│   │   │   ├── CategoryNav.astro         # Menu icon + pill khuyến mãi
│   │   │   ├── EcosystemBlock.astro      # Khối 3 thương hiệu trước footer
│   │   │   └── Footer.astro              # 3 cột + chứng nhận + newsletter + scroll-top
│   │   ├── home/
│   │   │   ├── HeroSection.astro         # 2 cột clean white
│   │   │   ├── CategoryCards.astro       # Grid 4 ô + pill trắng
│   │   │   ├── BestsellerGrid.astro      # Tabs + grid 5 cột + badge + swatches
│   │   │   ├── PromoBanner.astro         # Split 50/50
│   │   │   ├── WeeklyChoice.astro        # 3 card + ảnh hotspot
│   │   │   ├── WhyChooseUs.astro         # 2 cột + dome video
│   │   │   ├── NewsGrid.astro            # 4 blog card
│   │   │   └── FactoryReels.astro        # Video ngang full-width
│   │   ├── catalog/
│   │   │   ├── ProductCard.astro
│   │   │   ├── ProductFilter.astro       # 🏝 island
│   │   │   ├── ProductGallery.astro      # 🏝 island (swatches + zoom)
│   │   │   └── SpecTable.astro           # Bảng thông số — cũng là mồi GEO
│   │   ├── islands/
│   │   │   ├── SearchBox.ts              # Pagefind
│   │   │   ├── FilterEngine.ts
│   │   │   ├── Hotspot.ts
│   │   │   ├── Swatches.ts
│   │   │   └── QuoteForm.ts
│   │   └── seo/
│   │       ├── SEOHead.astro             # meta + OG + canonical + hreflang
│   │       ├── JsonLd.astro              # Organization / LocalBusiness / Product / FAQ / Breadcrumb
│   │       └── Breadcrumb.astro
│   │
│   ├── config/                           # Cấu hình dùng chung
│   │   ├── brands.ts                     # 3 brand: màu, logo, hotline, domain, social
│   │   └── schema.ts                     # Zod schema chung cho content collections
│   │
│   └── tokens/
│       ├── base.css                      # Spacing, radius, shadow, font scale (DNA chung)
│       ├── catbox.css                    # #0B0B0B #FF2E93 #00F2FE #D4AF37
│       ├── tetta.css                     # #FAF8F5 #8B1E2D #D4AF37 #5E101D
│       └── cfc.css                       # #FFFFFF #E67E22 #795548 #E74C3C #3E2723
│
├── sites/
│   ├── catbox/                           # 🌟 Dark Luxury Studio
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── about-us.astro
│   │   │   │   ├── industry/index.astro + [slug].astro
│   │   │   │   ├── products/index.astro + [slug].astro
│   │   │   │   ├── case-studies/index.astro + [slug].astro
│   │   │   │   ├── sharing/index.astro + [slug].astro
│   │   │   │   ├── contact.astro
│   │   │   │   ├── policies/[slug].astro
│   │   │   │   ├── sitemap.astro         # HTML sitemap cho user
│   │   │   │   └── 404.astro
│   │   │   ├── content/
│   │   │   │   ├── products/ industry/ case-studies/ blog/ policies/
│   │   │   ├── layouts/
│   │   │   └── styles/theme.css
│   │   ├── public/{llms.txt, robots.txt, favicon}
│   │   └── astro.config.mjs
│   │
│   ├── tetta/                            # 🎁 Luxury Gift (Bordeaux/Gold)
│   │   └── ... cùng cấu trúc, thay /industry bằng /bo-suu-tap
│   │
│   └── cfc/                              # 🥖 Direct Factory (Cam/Kraft)
│       └── ... cùng cấu trúc, thêm /bang-gia-si
│
├── scripts/
│   ├── gen-placeholder.ts                # Sinh ảnh placeholder theo brand
│   ├── gen-og-images.ts                  # OG image tự động từ title
│   └── check-content.ts                  # Cảnh báo MDX thiếu ảnh/meta trước khi deploy
│
├── workers/
│   └── quote-handler/                    # Cloudflare Worker: form → Telegram + Sheet
│
├── pnpm-workspace.yaml
└── package.json
```

### Chiến lược theme — 1 codebase, 3 bản sắc

Tailwind v4 cho phép định nghĩa token bằng CSS Variables. Mỗi site chỉ import 1 file theme:

```css
/* packages/tokens/tetta.css */
@theme {
  --color-primary:      #8B1E2D;
  --color-primary-deep: #5E101D;
  --color-accent:       #D4AF37;
  --color-surface:      #FAF8F5;
  --color-ink:          #1B1B1C;
  --font-display:       "Playfair Display", serif;
  --font-body:          "Montserrat", sans-serif;
  --radius-card:        16px;   /* DNA chung — cả 3 site giống nhau */
}
```

Component viết một lần với `bg-primary`, `font-display` — tự đổi màu theo site. Đây là điều làm cho **Tetta và CFC gần như miễn phí sau khi xong Tetta** (chỉ khác content + 1 file token).

---

## 6. SEO + GEO (mở rộng cho scope đầy đủ)

### A. SEO — Setup ban đầu

1. **Core Web Vitals**: mục tiêu LCP < 2.0s, CLS = 0, INP < 200ms trên 4G mô phỏng.
2. **JSON-LD** theo từng loại trang:
   | Trang | Schema |
   | :--- | :--- |
   | Homepage | `Organization` + `LocalBusiness` + `WebSite` (có `SearchAction`) |
   | Product detail | `Product` + `Offer` (price range) + `AggregateRating` (nếu có) + `Breadcrumb` |
   | Industry / Category | `CollectionPage` + `ItemList` |
   | Case study | `Article` + `ImageObject` |
   | Blog | `BlogPosting` + `Author` + `Breadcrumb` |
   | Contact | `LocalBusiness` + `ContactPoint` (hotline, Zalo) |
   | Mọi trang có FAQ | `FAQPage` |
3. **Liên kết 3 site**: `Organization.subOrganization` trên Catbox trỏ tới Tetta + CFC; `parentOrganization` ngược lại. Google hiểu đây là một tập đoàn → tăng E-E-A-T cho cả 3.
4. **Ảnh WebP/AVIF** + `width`/`height` + `alt` mô tả có từ khoá tự nhiên.
5. **Internal linking chéo**: Topbar Switcher + khối Ecosystem + link contextual trong blog.
6. **Sitemap XML tự động** + `robots.txt` + **HTML sitemap** cho người dùng.
7. **hreflang** nếu bật đa ngôn ngữ thật (xem cảnh báo §9).

### B. GEO (AI Search) — Setup ban đầu

1. **`/llms.txt`** cho mỗi site (năng lực, sản phẩm, thông số, liên hệ).
2. **`robots.txt` mở cho AI crawler**: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Claude-Web`, `Google-Extended`, `CCBot`.
3. **Bảng so sánh kỹ thuật có cấu trúc** trên mọi trang sản phẩm — AI ưu tiên cite dạng bảng.
4. **Dữ kiện gốc**: công suất xưởng, MOQ thật, thời gian sản xuất, số đơn đã giao, chứng nhận. AI ưu tiên nguồn có original data mà nơi khác không có.
5. **FAQ dạng câu hỏi tự nhiên** — khớp cách người ta hỏi ChatGPT, không phải cách gõ Google.

### C. Quy trình hàng tháng (~2.5M–3.5M/web)

| Tuần | Việc | Output |
| :---: | :--- | :--- |
| 1–2 | Viết **4–5 bài MDX/web** nhắm từ khoá dài | 12–15 bài/tháng cho 3 web |
| 1–2 | On-page: title, meta, H1–H3, alt, internal link | Kèm mỗi bài |
| 2 | Cập nhật `/llms.txt` + thêm 1 bảng so sánh mới | Mồi GEO |
| 3 | Thêm sản phẩm mới từ khách | File `.mdx` mới |
| 3 | Banner theo mùa (Tết, Trung Thu, Back-to-school) | Đổi ảnh hero |
| 4 | PageSpeed test — đảm bảo vẫn 95+ | Screenshot |
| 4 | Kiểm tra AI citation trên ChatGPT/Perplexity | Ghi nhận |
| 4 | **Báo cáo khách**: thứ hạng, traffic, số lead | PDF/Google Doc |

### D. Workflow deploy bài mới

```bash
vim sites/tetta/src/content/blog/top-10-hop-qua-tet-2027.mdx
pnpm check:content              # cảnh báo thiếu meta/ảnh trước khi push
git add . && git commit -m "blog: top 10 hộp quà tết 2027" && git push
# → Cloudflare tự build & deploy ~40 giây
```

---

## 7. Lộ trình thực tế (scope đầy đủ tính năng)

> [!WARNING]
> **7 ngày trong bản v1 chỉ đủ cho 3 homepage + vài trang phụ.** Với scope đầy đủ (12 template × 3 site, 8 island, i18n, filter, search), timeline thực tế là **18–22 ngày công**. Dưới đây là kế hoạch chia pha để **vẫn bàn giao được sớm** — khách thấy kết quả từ ngày 8.

### Pha 0 — Nền móng (Ngày 1–3)

| Ngày | Việc |
| :---: | :--- |
| 1 | PNPM workspace + 3 Astro project + Tailwind v4 + 3 file token + Content Collections schema (Zod) |
| 2 | Shared layout: TopbarSwitcher, MainHeader, CategoryNav, Footer, EcosystemBlock + script sinh placeholder theo brand |
| 3 | SEO core: SEOHead, JsonLd, Breadcrumb, sitemap, robots, `llms.txt` + Worker nhận form → Telegram |

### Pha 1 — Tetta hoàn chỉnh (Ngày 4–8) — *site mẫu, dựng chuẩn nhất*

| Ngày | Việc |
| :---: | :--- |
| 4 | Homepage: Hero, CategoryCards, BestsellerGrid (tabs + swatches), PromoBanner |
| 5 | Homepage: WeeklyChoice (hotspot island), WhyChooseUs (dome video), NewsGrid, FactoryReels |
| 6 | Catalog: `/products` + filter island + `/products/[slug]` (gallery, spec table, quote CTA) |
| 7 | About, Services (quy trình 6 bước), Contact (form phân loại + Maps), Policies |
| 8 | Blog archive + detail (TOC, share), Case studies archive + detail. **▶ Deploy staging — demo khách** |

### Pha 2 — CFC nhân bản (Ngày 9–11)

| Ngày | Việc |
| :---: | :--- |
| 9 | Copy cấu trúc Tetta, đổi token Cam/Kraft, thay toàn bộ nội dung F&B |
| 10 | Trang riêng CFC: `/bang-gia-si` (bảng giá theo số lượng), điều chỉnh menu + badge giá/túi |
| 11 | Rà soát 1:1 theo `thaiduong_design`, sửa lệch layout. **▶ Deploy staging CFC** |

### Pha 3 — Catbox flagship (Ngày 12–17) — *khó nhất, làm sau cùng*

| Ngày | Việc |
| :---: | :--- |
| 12 | Layout Dark Luxury + token neon/glow + hero 3D shelf theo Figma |
| 13 | Text Masking + Glow (GSAP island) — phần pixel-perfect nặng nhất |
| 14 | Industry archive + detail (5 lĩnh vực), hover typography |
| 15 | Products archive + detail, Case studies (Almaz…), lưới logo đối tác |
| 16 | About, Sharing/Blog, Contact form 3 nhánh, Policies, HTML sitemap |
| 17 | Rà soát 1:1 theo Figma. **▶ Deploy staging Catbox** |

### Pha 4 — Hoàn thiện & bàn giao (Ngày 18–20)

| Ngày | Việc |
| :---: | :--- |
| 18 | Thay ảnh/video thật khi khách gửi. Tối ưu WebP/AVIF, OG image, favicon |
| 19 | Audit: PageSpeed × 3 site × mobile/desktop, kiểm tra JSON-LD (Rich Results Test), test form, test 404, kiểm link chết |
| 20 | Trỏ DNS 3 domain, SSL, Google Search Console + GA4, submit sitemap, **bàn giao + hướng dẫn khách** |

> [!TIP]
> **Nếu buộc phải giữ 7 ngày:** bàn giao Pha 0 + 3 homepage + Contact (Ngày 1–7), rồi ký phụ lục cho phần trang trong. Đây là cách trung thực với khách hơn là hứa đủ tính năng trong 7 ngày rồi trễ hẹn.

---

## 8. Checklist gửi khách ngay hôm nay

Vì ảnh về sau nhưng **không phải mọi thứ đều phải chờ ảnh**, đây là những gì cần khách gửi để không chặn tiến độ:

**Cần ngay (chặn Pha 0–1):**
- [ ] Xác nhận định vị Tetta & CFC (mâu thuẫn ở §0)
- [ ] 3 domain (đã mua chưa? cần trỏ DNS về Cloudflare)
- [ ] Logo 3 thương hiệu — file gốc AI/SVG/PNG nền trong
- [ ] Thông tin pháp nhân: tên công ty, MST, địa chỉ nhà máy + văn phòng, hotline từng brand, Zalo, email
- [ ] Form báo giá gửi về đâu: **Telegram Bot** (đề xuất) / Email / Google Sheet
- [ ] Danh sách sản phẩm + quy cách + MOQ + khoảng giá (text, chưa cần ảnh)
- [ ] Chứng nhận ISO / HACCP / FSC / ATVSTP (bản quét)

**Gửi sau (Pha 4, không chặn):**
- [ ] Bộ ảnh theo bảng §4
- [ ] 3 video dây chuyền sản xuất
- [ ] Logo đối tác đã hợp tác
- [ ] Ảnh case study thực tế

---

## 9. Rủi ro & phương án xử lý

| Rủi ro | Mức | Xử lý |
| :--- | :---: | :--- |
| **Ảnh khách gửi muộn hoặc chất lượng kém** | 🔴 Cao | Placeholder theo brand từ ngày 1; gửi checklist §8 kèm ví dụ tỉ lệ ngay hôm nay; nếu quá muộn → bàn giao với placeholder + phụ lục thay ảnh |
| **Timeline 7 ngày vs scope đầy đủ** | 🔴 Cao | Chia pha §7, demo staging từ ngày 8. Trung thực với khách ngay từ đầu |
| **Mâu thuẫn định vị Tetta/CFC** | 🟠 TB | Chốt bằng văn bản trước khi viết content — sửa sau tốn cả bộ MDX + ảnh |
| **Đa ngôn ngữ 5 cờ** | 🟠 TB | Ảnh mẫu có 5 cờ nhưng dịch đủ 5 thứ tiếng × 3 site là dự án riêng. **Đề xuất:** làm VN + EN thật, các cờ khác ẩn đi hoặc bỏ. Không để cờ chết → hại UX và SEO |
| **Pixel-perfect Figma cho Catbox** | 🟠 TB | Làm sau cùng (Pha 3) khi đã quen codebase; text masking là kỹ thuật CSS `background-clip` + GSAP, có thể mất trọn 1 ngày |
| **Video nặng phá PageSpeed** | 🟡 Thấp | `preload="none"` + poster; > 20 MB → Cloudflare Stream |
| **Filter làm hỏng SEO** (nội dung ẩn sau JS) | 🟡 Thấp | Render toàn bộ sản phẩm trong HTML, filter chỉ toggle CSS. Crawler thấy đủ |
| **Bạn chưa dùng Astro** | 🟡 Thấp | Learning curve ~2–4 giờ nếu biết HTML/CSS/JS. Cú pháp `.astro` gần HTML thuần |

---

## 10. Chi phí vận hành

| Hạng mục | Astro + Cloudflare | WordPress (so sánh) |
| :--- | :---: | :---: |
| Hosting 3 site | **0đ** | 300K–750K/tháng |
| CMS | **Không cần** | 0đ (nhưng cần plugin trả phí) |
| SSL | **0đ** (auto) | 0–200K |
| Search | **0đ** (Pagefind tĩnh) | 0đ (nhưng nặng DB) |
| Form handler | **0đ** (Worker free tier: 100K req/ngày) | 0đ |
| Video | 0đ (self-host) hoặc ~120K nếu dùng Stream | 0đ (nhưng chậm) |
| Công cụ SEO | **0đ** (GSC + GA4) | 0đ |
| Domain × 3 | ~750K/năm | ~750K/năm |
| **Tổng/tháng** | **0đ** | **300K–750K** |
| **Thu về** (gói SEO 3 web) | **7.5M–10.5M/tháng** | Tương tự |

---

## 11. Bối cảnh cạnh tranh

### Site tham chiếu: lygiaythaiduong.com

| Tiêu chí | Thực trạng |
| :--- | :--- |
| Tech | WordPress + WooCommerce + Flatsome |
| Mobile PageSpeed | ~35–50/100 |
| TTFB | ~800–1500 ms (hosting VN shared) |
| Vấn đề | Slider nặng, ảnh không optimize, font chậm, CLS cao |
| **Bài học** | **UX flow tốt — đáng copy layout. Nền tảng kỹ thuật kéo lùi ranking — không copy** |

### Ngành in ấn VN

| Site | Tech | Mobile PageSpeed |
| :--- | :--- | :---: |
| intienkien.com | WordPress | 25–45 |
| inansenvang.com | WordPress | 30–50 |
| Xưởng in VN nói chung | ~95% WordPress | 25–55 |

> [!TIP]
> **Toàn ngành in ấn VN chạy WordPress ở mức 25–55 điểm mobile.** Đạt 95+ với Astro là lợi thế Core Web Vitals gần như tuyệt đối — và vì đây là lợi thế **kiến trúc** (không phải tối ưu vặt), đối thủ không thể đuổi kịp mà không làm lại toàn bộ website.

### Benchmark quốc tế (tham khảo)

| Site | Tech | Lý do dùng tech đó |
| :--- | :--- | :--- |
| noissue.co | Next.js + Headless Shopify | Có 3D customizer + checkout → cần React |
| packlane.com | React SPA + Rails API | Real-time 3D box builder + dynamic pricing → cần SPA |

Dự án này **không có** 3D customizer, **không có** checkout, **không có** tài khoản người dùng → không cần React/Next.js.

---

## 12. Tiêu chí nghiệm thu

Bàn giao chỉ được coi là xong khi đủ các mục sau, đo bằng số:

| # | Tiêu chí | Ngưỡng |
| :---: | :--- | :--- |
| 1 | PageSpeed mobile × 3 site (trang chủ + 1 catalog + 1 detail) | ≥ 92 |
| 2 | PageSpeed desktop | ≥ 98 |
| 3 | CLS | = 0 |
| 4 | LCP mobile 4G | < 2.5 s |
| 5 | Rich Results Test qua sạch | 0 lỗi |
| 6 | Đủ 12 route template × 3 site | 100% |
| 7 | Form báo giá gửi được về Telegram | Test thật |
| 8 | Search trả kết quả đúng trên cả 3 site | Test thật |
| 9 | Filter catalog hoạt động + share link được | Test thật |
| 10 | Không có link chết (internal + external) | 0 |
| 11 | Sitemap XML submit lên GSC × 3 | Done |
| 12 | GA4 ghi nhận sự kiện `submit_quote`, `click_zalo`, `click_hotline` | Test thật |
| 13 | Responsive 360px / 768px / 1440px / 1920px | Không vỡ |
| 14 | `llms.txt` + robots.txt mở AI crawler | Done |

---

## 13. Open Questions

> [!IMPORTANT]
> **Cần chốt trước khi bắt tay:**

1. **Định vị Tetta & CFC** — theo REQUIREMENTS (hộp quà Tết / bao bánh mì) hay theo CONSULTING_SCRIPT (ly giấy / bao bì thực phẩm)? *Đây là câu hỏi chặn quan trọng nhất — sai là làm lại toàn bộ nội dung.*
2. **Timeline** — chấp nhận 18–20 ngày cho scope đầy đủ, hay bàn giao 7 ngày phần lõi rồi làm tiếp theo phụ lục?
3. **Đa ngôn ngữ** — làm thật VN + EN, hay chỉ VN (bỏ dãy cờ)? Không nên để cờ bấm vào không có gì.
4. **Nút "Đăng Nhập / Đăng Ký"** — đổi thành CTA báo giá như đề xuất §3, hay khách thực sự muốn có hệ thống tài khoản?
5. **3 domain** đã mua chưa? Tên chính xác là gì?
6. **Form báo giá gửi về đâu?** Telegram Bot (đề xuất — khách nhận lead ngay trên điện thoại), Email, hay Google Sheet?
7. **Bảng giá CFC** — hiện giá công khai trên web hay chỉ "liên hệ báo giá"? Ảnh hưởng tới schema `Offer` và khả năng lên Google Shopping.
8. **Bạn đã dùng Astro chưa?** Nếu chưa: ~2–4 giờ đọc docs là đủ. Nếu chỉ muốn dùng Next.js: vẫn làm được, nhưng chấp nhận PageSpeed 72–88 thay vì 92–99, và mất lợi thế cạnh tranh ở §11.

---

## 14. Tóm tắt thay đổi so với v1

| Mục | v1 | v2 |
| :--- | :--- | :--- |
| Kết luận stack | Astro + Tailwind + Cloudflare | **Không đổi** — nhưng lý do là Islands, không phải "0 KB JS" |
| Quy mô | ~10–12 trang | **12 template × 3 site** |
| Tương tác | "Không phức tạp" | **8 island** được đặc tả chi tiết (§3) |
| Search | Không nhắc | **Pagefind** |
| Đa ngôn ngữ | Không nhắc | **`astro:i18n`** + cảnh báo scope (§9) |
| Ảnh về sau | Không tính đến | **Chiến lược placeholder + checklist bàn giao** (§4, §8) |
| Timeline | 7 ngày | **18–20 ngày, chia 4 pha, demo từ ngày 8** (§7) |
| Rủi ro | Không có | **Bảng 8 rủi ro + xử lý** (§9) |
| Nghiệm thu | Không có | **14 tiêu chí đo được** (§12) |
| Mâu thuẫn tài liệu | Không phát hiện | **Định vị Tetta/CFC** (§0) |

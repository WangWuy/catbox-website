# 🔍 ĐÁNH GIÁ TECH STACK: Hệ sinh thái 3 Website Catbox – Tetta – CFC

> Đánh giá trung thực, dựa trên bối cảnh thực tế của dự án.
> Cập nhật: **Bạn là người làm SEO/GEO hàng tháng** → không cần CMS cho khách.

---

## 1. Bản chất dự án

| Yếu tố | Thực tế |
| :--- | :--- |
| **Loại website** | Brochure / Catalog / Lead Generation — KHÔNG phải SaaS, KHÔNG e-commerce checkout |
| **Tương tác phức tạp?** | Không. Xem sản phẩm → gửi form báo giá → gọi Zalo/Hotline |
| **Ai cập nhật nội dung?** | **Bạn (developer)** — làm luôn gói SEO/GEO hàng tháng |
| **Timeline** | 5–7 ngày cho cả 3 website |
| **Số trang unique** | ~10–12 trang (Tetta & CFC dùng chung layout, đổi theme + nội dung) |
| **Hiệu ứng đặc biệt** | Catbox: Text Masking, Glow neon, hover typography. Tetta & CFC: layout thương mại chuẩn |

> [!IMPORTANT]
> Vì bạn tự chạy SEO hàng tháng bằng cách viết file MDX rồi `git push`, **không cần CMS** (Keystatic, Strapi, WordPress admin...). Stack gọn nhất có thể.

---

## 2. So sánh 4 phương án

### ❌ Phương án A: Next.js 15 + Tailwind + Turborepo

| Ưu điểm | Nhược điểm |
| :--- | :--- |
| ✅ SEO tốt (SSR/SSG, Metadata API) | ❌ **Overkill** — xe tải 20 tấn chở thư |
| ✅ Ecosystem React lớn | ❌ React runtime 80–150KB JS gửi về client cho mỗi trang catalog tĩnh |
| ✅ Code component dùng chung | ❌ Turborepo monorepo phức tạp không cần thiết |
| | ❌ PageSpeed mobile thực tế **75–92**, khó đạt 100 |
| | ❌ Nhiều moving parts: RSC + App Router + bundler config |

**Verdict:** Sinh ra cho web application (SaaS, dashboard), không phải catalog bao bì.

---

### ❌ Phương án B: WordPress + Theme tùy chỉnh

| Ưu điểm | Nhược điểm |
| :--- | :--- |
| ✅ Quen thuộc thị trường VN | ❌ PageSpeed mobile **30–55/100** (lygiaythaiduong.com đang chạy WP chỉ đạt ~40) |
| ✅ Nhiều dev VN biết bảo trì | ❌ **Rất khó** dựng Pixel-Perfect Catbox (Text Masking, Glow neon) |
| ✅ Plugin SEO sẵn (RankMath) | ❌ 3 site = 3 WordPress riêng → bảo trì gấp 3 |
| | ❌ Cần server PHP/MySQL → 300K–750K/tháng hosting |
| | ❌ Bảo mật: mục tiêu hack #1 thế giới |
| | ❌ **GEO rất kém** — khó tuỳ biến cấu trúc cho AI crawl |

**Verdict:** Dễ dùng cho khách, nhưng bạn tự làm SEO nên lợi thế này không còn. Performance thua xa.

---

### 🟡 Phương án C: Next.js 15 đơn giản (không Turborepo)

| Ưu điểm | Nhược điểm |
| :--- | :--- |
| ✅ Nếu bạn đã quen React/Next.js, không mất thời gian học | ❌ Vẫn gửi React runtime thừa cho trang tĩnh |
| ✅ SEO tốt với Metadata API | ❌ PageSpeed mobile 80–92, phải optimize kỹ mới lên 95+ |
| ✅ Vercel deploy dễ | ❌ Vercel free tier giới hạn bandwidth → 3 site có thể phải trả phí |

**Verdict:** Chấp nhận được nếu bạn chỉ quen Next.js và không muốn học Astro. Nhưng không tối ưu.

---

### ⭐ Phương án D (KHUYẾN NGHỊ): Astro 5 + Tailwind v4 + MDX

| Hạng mục | Chi tiết |
| :--- | :--- |
| **Framework** | **Astro 5** — Ships 0 KB JavaScript mặc định. Chỉ load JS cho phần cần (Island) |
| **Styling** | **Tailwind CSS v4** — Config 3 bộ theme bằng CSS Variables (`--color-primary`, `--color-accent`) |
| **Content** | **MDX files** — Bạn viết bài blog/sản phẩm bằng Markdown, `git push` → auto deploy |
| **Animation (Catbox)** | **GSAP hoặc CSS-only** cho Text Masking + Glow — load như Astro Island, không ảnh hưởng trang khác |
| **Form** | **Formspree / Web3Forms** (free) hoặc Cloudflare Workers đẩy về **Telegram Bot** |
| **Deploy** | **Cloudflare Pages** — CDN edge tại Việt Nam, TTFB < 50ms, SSL tự động, **\$0/tháng** |
| **SEO** | Astro built-in: sitemap, robots.txt, JSON-LD injection, OpenGraph |
| **GEO** | `/llms.txt` + bảng so sánh structured + FAQ schema |

### Tại sao Astro?

| So sánh | Astro | Next.js | WordPress |
| :--- | :---: | :---: | :---: |
| JS gửi về client (trang catalog) | **0 KB** | 80–150 KB | 200–500 KB |
| PageSpeed mobile | **98–100** | 75–92 | 30–55 |
| TTFB qua CDN | **< 50ms** | 150–350ms | 500–1500ms |
| Hosting/tháng | **\$0** | \$0–20 | \$5–25 |
| Bảo mật | **Không server để hack** | Thấp | Cao (WP vulnerabilities) |
| Dựng hiệu ứng Catbox | ✅ Island + GSAP | ✅ React | ❌ Rất khó |
| Learning curve | Thấp (HTML/CSS + JS) | Trung bình (React) | Thấp |

---

## 3. Đối thủ — Thực trạng & Cơ hội

### Site tham khảo gốc: lygiaythaiduong.com

| Tiêu chí | Thực trạng |
| :--- | :--- |
| **Tech** | WordPress + WooCommerce + Flatsome |
| **Mobile PageSpeed** | **~35–50/100** |
| **TTFB** | ~800–1500ms (hosting VN shared) |
| **Vấn đề** | Slider nặng, ảnh không optimize, font chậm, CLS cao |
| **Bài học** | UX flow tốt (copy layout), nhưng nền tảng kỹ thuật kéo lùi ranking |

### Các site in ấn VN khác

| Site | Tech | Mobile PageSpeed |
| :--- | :--- | :---: |
| intienkien.com | WordPress | 25–45 |
| inansenvang.com | WordPress | 30–50 |
| Các xưởng in ấn VN nói chung | 95% WordPress | 25–55 |

### Cơ hội cạnh tranh

> [!TIP]
> **Toàn bộ đối thủ ngành in ấn VN đều dùng WordPress với PageSpeed 25–55 điểm mobile.** Nếu bạn dựng Astro đạt **98–100 điểm**, bạn vượt mặt tuyệt đối về Core Web Vitals — yếu tố Google đang ưu tiên cho ranking. Đây là lợi thế cạnh tranh cực lớn mà gần như không đối thủ nào trong ngành có.

### Benchmark quốc tế (tham khảo, không cần copy)

| Site | Tech | Lý do dùng tech đó |
| :--- | :--- | :--- |
| **noissue.co** | Next.js + Headless Shopify | Có 3D customizer + checkout phức tạp → cần React |
| **packlane.com** | React SPA + Rails API | Có real-time 3D box builder + dynamic pricing → cần SPA |

> Dự án Catbox **không có** 3D customizer hay checkout → không cần React/Next.js.

---

## 4. Chiến lược SEO + GEO

### A. SEO (Google Search) — Setup ban đầu + Hàng tháng

#### Setup ban đầu (trong 7 ngày dựng site)

1. **Core Web Vitals hoàn hảo** — Astro đạt 98–100 mặc định
2. **Schema JSON-LD** cho mỗi site:
   - `Organization` (Catbox Group) + liên kết `Corporation` (Tetta, CFC)
   - `LocalBusiness` — địa chỉ xưởng, hotline, giờ làm việc → hiện Google Maps
   - `Product` — thông số kỹ thuật (chất liệu, kích thước, MOQ)
   - `FAQPage` — câu hỏi thường gặp → chiếm diện tích SERP
   - `BreadcrumbList` → breadcrumb trên kết quả tìm kiếm
3. **Ảnh WebP/AVIF** + `width`/`height` explicit → zero CLS
4. **Internal linking chéo 3 site** qua Topbar Switcher + Footer Ecosystem
5. **XML Sitemap** + `robots.txt` tự động

#### Quy trình SEO hàng tháng (~2.5M–3.5M/web)

| Tuần | Việc | Output |
| :---: | :--- | :--- |
| **1–2** | Viết **4–5 bài blog MDX/web** nhắm từ khoá dài ngành bao bì | 12–15 bài/tháng tổng 3 web |
| **1–2** | Tối ưu On-page: title, meta, H1–H3, alt ảnh, internal link | Kèm mỗi bài |
| **3** | Thêm/cập nhật sản phẩm mới từ khách | File `.mdx` mới |
| **3** | Cập nhật banner theo mùa (Tết, Trung Thu, Back-to-school) | Đổi ảnh hero |
| **4** | Chạy PageSpeed test — đảm bảo vẫn 95+ | Screenshot báo cáo |
| **4** | **Báo cáo cho khách**: thứ hạng từ khóa, traffic, số lead | File PDF/Google Doc |

#### Workflow deploy bài viết mới

```bash
# Viết bài mới
vim sites/tetta/src/content/blog/top-10-hop-qua-tet-2027.mdx

# Push lên → Cloudflare tự build & deploy trong 30 giây
git add . && git commit -m "blog: top 10 hộp quà tết 2027" && git push
```

Xong. Không cần login admin, không cần CMS, không cần server.

---

### B. GEO (AI Search) — Setup + Hàng tháng

#### Setup ban đầu

1. **Tạo `/llms.txt`** trên mỗi site:
   ```markdown
   # Catbox Packaging
   > Xưởng sản xuất bao bì hộp cứng cao cấp tại TP.HCM
   
   ## Năng lực
   - Công suất: 500.000 hộp/tháng
   - Chất liệu: Ivory 300gsm, Duplex, Art Paper
   - Gia công: Ép kim 3D, dập nổi, phủ UV, cán màng
   
   ## Sản phẩm chính
   - Hộp cứng cao cấp (mỹ phẩm, thời trang, dược phẩm)
   - Túi giấy thương hiệu
   ```

2. **Mở `robots.txt` cho AI crawler**:
   ```
   User-agent: GPTBot
   Allow: /
   User-agent: PerplexityBot
   Allow: /
   User-agent: Claude-Web
   Allow: /
   ```

3. **Bảng so sánh kỹ thuật** có cấu trúc trên mỗi trang sản phẩm — AI cực thích cite dạng bảng

#### Quy trình GEO hàng tháng (kết hợp trong gói SEO)

| Việc | Chi tiết |
| :--- | :--- |
| Cập nhật `/llms.txt` | Thêm sản phẩm mới, giá mới, thông số mới |
| Tạo bảng so sánh mới | VD: *"5 loại giấy in bao bánh mì 2027"*, *"So sánh giấy MG vs Kraft cho F&B"* |
| Thêm dữ kiện gốc | Số liệu xưởng, số đơn đã giao, chứng nhận → AI ưu tiên nguồn có original data |
| Kiểm tra AI citation | Search trên ChatGPT/Perplexity: *"xưởng in bao bì bánh mì giá rẻ HCM"* → đã cite chưa? |
| Cập nhật FAQ | Thêm câu hỏi mới từ thực tế tư vấn khách → JSON-LD `FAQPage` |

---

## 5. Kiến trúc workspace

```
catbox-ecosystem/
├── packages/
│   └── ui/                          # Shared components
│       ├── TopbarSwitcher.astro     # Menu chuyển đổi 3 brand
│       ├── EcosystemFooter.astro    # Footer + khối 3 thương hiệu
│       ├── ProductCard.astro        # Card sản phẩm (badge, swatches, giá)
│       ├── QuoteForm.astro          # Form báo giá → Telegram Bot
│       ├── BlogCard.astro           # Card bài viết
│       └── SEOSchema.astro          # JSON-LD schema injection
│
├── sites/
│   ├── catbox/                      # 🌟 Site 1: Dark Luxury
│   │   ├── src/
│   │   │   ├── pages/              # 8 page templates
│   │   │   ├── content/
│   │   │   │   ├── products/       # Sản phẩm (.mdx)
│   │   │   │   ├── blog/           # Bài viết SEO (.mdx)
│   │   │   │   └── case-studies/   # Dự án tiêu biểu (.mdx)
│   │   │   ├── layouts/
│   │   │   └── styles/theme.css    # Theme: #0B0B0B, #FF2E93, #00F2FE
│   │   ├── public/
│   │   │   ├── llms.txt
│   │   │   └── robots.txt
│   │   └── astro.config.mjs
│   │
│   ├── tetta/                       # 🎁 Site 2: Luxury Gift
│   │   ├── src/
│   │   │   ├── pages/              # Clone layout từ thaiduong_design
│   │   │   ├── content/            # Sản phẩm + blog Tetta
│   │   │   └── styles/theme.css    # Theme: #FAF8F5, #8B1E2D, #D4AF37
│   │   └── ...
│   │
│   └── cfc/                         # 🥖 Site 3: Direct Factory
│       ├── src/
│       │   ├── pages/              # Nhân bản từ Tetta, đổi nội dung
│       │   ├── content/            # Sản phẩm + blog CFC
│       │   └── styles/theme.css    # Theme: #FFFFFF, #E67E22, #795548
│       └── ...
│
├── pnpm-workspace.yaml
└── package.json
```

> [!NOTE]
> **PNPM Workspace** đơn giản (không cần Turborepo). 3 site Astro riêng biệt, share `packages/ui/`. Mỗi site deploy lên Cloudflare Pages với domain riêng.

---

## 6. Lộ trình 7 ngày

| Ngày | Việc |
| :--- | :--- |
| **1** | Setup PNPM workspace + 3 Astro projects + Tailwind 3 theme tokens + shared `packages/ui/` |
| **2** | Dựng shared components: TopbarSwitcher, Header, Footer, ProductCard, QuoteForm, SEO Schema, BlogCard |
| **3** | **Catbox Homepage** pixel-perfect theo [Figma](file:///Users/Company/catbox/assets/figma_design/): Hero 3D shelf, Text Masking, Case Study, Industry typography, Footer CTA |
| **4** | **Tetta Homepage** clone layout [Thái Dương](file:///Users/Company/catbox/assets/thaiduong_design/): Hero, Danh mục 4 cards, Bestseller 5-col, Promo, Blog, Footer Bordeaux |
| **5** | **CFC Homepage** nhân bản Tetta + đổi theme Cam/Kraft. Hoàn thiện trang phụ (About, Contact, Products, Blog archive) |
| **6** | SEO: JSON-LD schema, sitemap, robots.txt, llms.txt, OpenGraph images, ảnh WebP, FAQ |
| **7** | Deploy Cloudflare Pages × 3 domain, test PageSpeed, form Telegram Bot, bàn giao |

---

## 7. Chi phí vận hành

| Hạng mục | Astro + MDX + Cloudflare | WordPress (so sánh) |
| :--- | :---: | :---: |
| Hosting 3 site | **0đ** | 300K–750K/tháng |
| CMS | **Không cần** (bạn viết MDX) | 0đ (WP core free) |
| SSL | **0đ** (Cloudflare auto) | 0–200K |
| Công cụ SEO | **0đ** (GSC + GA4 + KW Planner) | 0đ |
| Deploy bài mới | **`git push`** (30 giây) | Login WP admin |
| **Tổng/tháng** | **0đ** | **300K–750K** |
| **Thu về** (gói SEO 3 web) | **7.5M–10.5M/tháng** | Tương tự |

---

## 8. Open Questions

> [!IMPORTANT]
> **Cần xác nhận trước khi bắt tay:**

1. **Bạn đã dùng Astro bao giờ chưa?** Nếu chưa cũng OK — nếu biết HTML/CSS/JS cơ bản thì learning curve Astro rất thấp (~1–2 giờ đọc docs). Nếu bạn chỉ quen Next.js và muốn dùng luôn thì Phương án C (Next.js đơn giản, không Turborepo) vẫn chấp nhận được.

2. **3 domain đã có chưa?** Cần để config DNS Cloudflare Pages.

3. **Ảnh sản phẩm thật đã có chưa?** Hay hiện tại chỉ có ảnh Figma mockup? Blog SEO và catalog cần ảnh thật để rank Google Image Search.

4. **Form báo giá gửi về đâu?** Telegram Bot của khách, Email, hay Google Sheet?

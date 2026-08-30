# 📦 HỆ SINH THÁI 3 WEBSITE: CATBOX – TETTA – CFC
### (PACKAGING & PRINTING SOLUTIONS ECOSYSTEM)

> Monorepo PNPM chứa 3 website ngành sản xuất in ấn & bao bì — chia sẻ chung component, design tokens, và hạ tầng deploy.

---

## 🌐 1. TỔNG QUAN 3 DỰ ÁN WEBSITE

| Dự án | Phân khúc | Phong cách thiết kế | Domain |
| :--- | :--- | :--- | :--- |
| **🌟 CATBOX** | **Flagship Brand:** Bao bì cao cấp, Hộp cứng thương hiệu | **Dark Luxury Studio:** Nền đen `#0B0B0B`, Glow hồng neon `#FF2E93` & xanh cyan `#00F2FE` | catbox.vn |
| **🎁 TETTA** | **Luxury Gift:** Bao bì quà tặng sang trọng, Hộp quà Tết | **Elegant Boutique:** Nền kem `#FAF8F5`, Đỏ rượu `#8B1E2D`, Ánh kim Gold `#D4AF37` | tetta.vn |
| **🥖 CFC** | **Direct Factory:** Xưởng sỉ bao bánh mì & túi giấy F&B | **Industrial Fast-Commerce:** Nền trắng `#FFFFFF`, Vàng cam `#E67E22`, Nâu Kraft | cfc.vn |

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
catbox-ecosystem/
├── 📄 README.md                           # Tổng quan & hướng dẫn dự án
├── 📄 DEVELOPMENT.md                      # Hướng dẫn phát triển chi tiết
├── 📄 package.json                        # Root workspace config
├── 📄 pnpm-workspace.yaml                 # Khai báo workspace packages
│
├── 📁 docs/                               # Tài liệu đặc tả dự án
│   ├── REQUIREMENTS.md                    #   Đặc tả kỹ thuật, bảng màu, 8 templates
│   ├── TECH_STACK_v2.md                   #   Chi tiết tech stack đã chọn
│   ├── DANH_GIA_TECH_STACK.md             #   Đánh giá & so sánh tech stack
│   ├── TETTA_CFC_DESIGN_SPEC.md           #   Đặc tả 1:1 theo thaiduong_design
│   └── CONSULTING_SCRIPT.md               #   Kịch bản tư vấn & upsell
│
├── 📁 design/                             # Tài nguyên thiết kế (không phải code)
│   ├── 📁 catbox/                         #   Thiết kế cho Catbox
│   │   ├── 📁 figma/                      #     Ảnh Figma gốc (8 section)
│   │   │   ├── 01_hero_section.png
│   │   │   ├── 02_about_section.png
│   │   │   ├── 03_service_creative_design.png
│   │   │   ├── 04_casestudy_showcase.png
│   │   │   ├── 05_industry_verticals.png
│   │   │   ├── 06_clients_partners.png
│   │   │   ├── 07_footer_cta.png
│   │   │   └── sitemap_architecture.png
│   │   └── SITEMAP_CATBOX.md              #     Sơ đồ sitemap & URL routing
│   ├── 📁 cfc/                            #   Thiết kế cho CFC
│   │   ├── 📁 branding/                   #     Logo, banner, sitemap gốc
│   │   ├── 📁 products/                   #     Ảnh sản phẩm thật
│   │   ├── 📁 mockups/                    #     UI mockups (HTML prototype)
│   │   └── 📁 reference/                  #     6 ảnh mẫu lygiaythaiduong.com
│   └── 📁 tetta/                          #   Thiết kế cho Tetta (chờ bổ sung)
│
├── 📁 packages/                           # Shared packages (dùng chung 3 site)
│   ├── 📁 config/                         #   brands.ts, schema.ts, nav.ts, keystatic-fields.ts
│   ├── 📁 tokens/                         #   base.css + 3 theme CSS
│   └── 📁 ui/                             #   Astro components dùng chung
│       ├── catalog/                       #     ProductCard, ProductFilter
│       ├── home/                          #     Hero, Bestseller, Stats, Process...
│       ├── islands/                       #     FloatingCta, QuoteForm, SearchBox
│       ├── layout/                        #     BaseLayout, Header, Footer, TopbarSwitcher
│       ├── lib/                           #     Utilities (images.ts)
│       ├── media/                         #     SmartImage
│       └── seo/                           #     Breadcrumb, JsonLd, SEOHead
│
├── 📁 sites/                              # 3 Astro sites (mỗi site = 1 domain)
│   ├── 📁 catbox/                         #   → catbox.vn (Dark Luxury)
│   ├── 📁 cfc/                            #   → cfc.vn (Industrial Fast-Commerce)
│   │   └── 📄 keystatic.config.ts         #     CMS config (thí điểm Keystatic Cloud)
│   └── 📁 tetta/                          #   → tetta.vn (Elegant Boutique)
│
├── 📁 workers/                            # Cloudflare Workers
│   └── 📁 quote-handler/                  #   Form → Telegram + Google Sheet
│
└── 📁 scripts/                            # Build & QA scripts
    ├── gen-placeholder.mjs                #   Sinh SVG placeholder theo brand
    └── check-content.mjs                  #   Kiểm tra thiếu meta/ảnh
```

---

## 🚀 3. HƯỚNG DẪN KHI BẮT ĐẦU PHIÊN MỚI (QUICK START)

Khi mở một phiên làm việc mới, đọc lần lượt:

1. **`README.md`** — Bức tranh tổng thể hệ sinh thái
2. **`DEVELOPMENT.md`** — Hướng dẫn chạy local, build, deploy
3. **`docs/REQUIREMENTS.md`** — Mã màu Hex, font chữ, styling tokens, 8 page templates
4. **`docs/TETTA_CFC_DESIGN_SPEC.md`** — Đặc tả 1:1 theo Thái Dương
5. **`design/<brand>/`** — Ảnh Figma, mockups, reference để code giao diện pixel-perfect

---

## 🛠 4. TECH STACK

- **Framework:** Astro (Static SSG) + TailwindCSS — site `cfc` đã nâng lên Astro 7 (yêu cầu bắt buộc của Keystatic), `catbox`/`tetta` vẫn ở Astro 5
- **Shared UI:** Astro components trong `packages/ui/`, chia 4 tầng theo mức độ dùng chung:

  | Tầng | Biết brand nào? | Dùng cho |
  |---|---|---|
  | `primitives/` | Không | Mảnh nhỏ tái dùng khắp nơi: `SmartImage`, `ProductCard`, `SearchBox`, `Breadcrumb` |
  | `patterns/` | Không — chỉ nhận props | Khối trang: `HeroBanner`, `BestsellerGrid`, `NewsGrid`, `FactoryReels` |
  | `shared/` | Có, nhưng chỉ đọc dữ liệu | Thật sự chung cả 3 site: `SEOHead`, `JsonLd`, `QuoteForm`, `FloatingCta` |
  | `brand/` | Có, và đổi cả cấu trúc DOM | Bộ khung riêng: `brand/fnb/` (CFC + Tetta), `brand/catbox/` |

  **Quy tắc đặt file:** component nào *không* import `@config/brands` thì thuộc `primitives/` hoặc `patterns/`. Component cần biết brand để đổi cấu trúc DOM thì phải nằm trong `brand/` — **không nhồi thêm nhánh `if (brand === …)`**.

  Catbox (Dark Luxury Studio) có khung hoàn toàn khác CFC/Tetta nên dùng `brand/catbox/BaseLayout.astro` riêng: không topbar giá sỉ, không CategoryNav e-commerce, header gộp nav + switcher hệ sinh thái. Kiểu `FnbBrandId` trong `packages/config/brands.ts` khiến việc truyền `brand="catbox"` vào component F&B thành **lỗi biên dịch**, không phải lỗi lúc chạy.
- **Design Tokens:** CSS custom properties trong `packages/tokens/`
- **CMS:** Keystatic Cloud — cho phép sửa nội dung (sản phẩm, banner, thông tin liên hệ) qua giao diện `/keystatic` mà không cần biết Git/Markdown. Đang thí điểm trên site `cfc`, chạy qua cờ `KEYSTATIC_ADMIN=true` (dev-only, không ảnh hưởng build production tĩnh). Xem `plans/01-keystatic-cms-integration.md` để biết tiến độ và lý do lựa chọn.
- **Worker:** Cloudflare Worker (form submission → Telegram + Sheet)
- **Search:** Pagefind (sinh sau khi build)
- **SEO:** JSON-LD, OpenGraph, WebP/AVIF auto-optimize
- **Deploy:** Cloudflare Pages (3 project riêng, 1 repo)
- **Package Manager:** pnpm workspaces

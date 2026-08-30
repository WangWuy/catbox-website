# Plan: Tích hợp Keystatic CMS (Keystatic Cloud) cho 3 site Catbox/Tetta/CFC

## Bối cảnh & quyết định kiến trúc

`docs/TECH_STACK_v2.md` §1 (dòng 35, 40-41) đã ghi quyết định "không cần CMS" — nhưng giả định gốc là **"Bạn (developer) là người duy nhất cập nhật nội dung qua MDX + git push"**. Giả định này không còn đúng: cửa hàng (người không biết Git/code) cần tự đăng nhập sửa sản phẩm/banner/footer. Đây là **bổ sung có điều kiện đã đổi**, không phải đảo ngược quyết định gốc — kết luận "CMS truyền thống (WordPress/Strapi) là thừa" trong tài liệu vẫn đúng; Keystatic không phải CMS truyền thống (không database/backend riêng, vẫn ghi thẳng vào file Markdown trong Git).

### Vì sao Keystatic Cloud, không phải GitHub self-host mode

Nghiên cứu xác nhận (keystatic.com/docs/github-mode, /docs/installation-astro):

- Keystatic Admin UI (ở mode `github` hay `cloud`) **bắt buộc chạy server-side code** để xử lý OAuth — không tương thích với site build `output: 'static'` thuần đang dùng cho Cloudflare Pages.
- Ở mode `github` (tự tạo GitHub App, tự host callback OAuth), có **bug đang mở, chưa fix chính thức** khi chạy trên Cloudflare Pages/Workers runtime: OAuth state không được sinh đúng do khác biệt Web Crypto/Cookie API so với Node.js (github.com/Thinkmill/keystatic/issues/1497). Giải pháp cộng đồng là các bản vá không chính thức (postinstall script tự patch `@keystatic/core`) — không phù hợp để phụ thuộc vào cho một dự án khách hàng thật.
- Ở mode `github`, người dùng cuối (cửa hàng) **bắt buộc phải có tài khoản GitHub với quyền `write`** trên repo — rào cản không nhỏ với người không rành kỹ thuật.
- **Keystatic Cloud** (dịch vụ managed của chính Keystatic) giải quyết cả 2 vấn đề: (a) tự lo toàn bộ OAuth/hạ tầng, né hoàn toàn bug Cloudflare Pages; (b) cửa hàng đăng nhập bằng email, không cần tài khoản GitHub. Chi phí: **free tới 3 user/team**; **Pro $10/tháng + $5/user** thêm nếu cần (mở khoá Cloud Images — upload ảnh không cần commit binary vào Git).
- Site chính (`sites/<brand>`) **giữ nguyên `output: 'static'`, không cần adapter, không đổi gì về deploy Cloudflare Pages hiện tại** — vì Keystatic Cloud tự vận hành phần backend/OAuth của nó, Astro site chỉ cần route `/keystatic` gọi tới Cloud API lúc admin thao tác (không chạy trên production runtime của site tĩnh).

### Giới hạn cần biết trước khi bắt đầu

- Ảnh upload qua Keystatic Cloud ở tier Free vẫn commit thẳng vào repo Git (`public/` hoặc `src/assets/`) — **không có Cloud Images ở Free tier**. Nếu ảnh sản phẩm nhiều/nặng, cân nhắc nâng Pro ($10+/tháng) để dùng Cloud Images (không phình dung lượng repo Git). Quyết định này để ngỏ tới Phase 2 sau khi thấy khối lượng ảnh thực tế.
- Field nội dung dài nên dùng **`fields.mdx`** (sinh file `.mdx` chuẩn), **không dùng `fields.markdoc`** (sinh file `.mdoc` — định dạng AST riêng, KHÔNG tương thích với Astro Content Collections loader `glob({pattern:"**/*.{md,mdx}"})` đang dùng ở `content.config.ts`). Với các field text ngắn (excerpt, description) dùng `fields.text`.
- Ảnh trong content hiện là `string` thuần (không dùng helper `image()` của Astro) — lý do ghi rõ ở `packages/ui/lib/images.ts:4-19`: schema Zod dùng chung 3 site, phải tự quản lý qua `AssetMap` + `resolveImage()`. Keystatic `fields.image({directory: 'src/assets/...'})` cần trỏ đúng thư mục để giá trị trả về (path tương đối) khớp với cách `resolveImage()` build lại key `/src/assets/${ref}` (xem Phase 1, Task 1.3).
- Mỗi site Astro (`sites/catbox`, `sites/tetta`, `sites/cfc`) cần **1 file `keystatic.config.ts` riêng** (không dùng chung 1 file cho 3 site) — nhưng field definitions dùng chung nên tách thành helper trong `packages/config/` để 3 site import lại, giữ đúng tinh thần "1 nguồn sự thật" hiện có của `brands.ts`/`schema.ts`.

### Vì sao thí điểm trên `cfc` chứ không phải `catbox`

Theo khảo sát `DEVELOPMENT.md` (dòng 118-124): **`cfc` đã hoàn chỉnh UI** (10 khối trang chủ + catalog + blog đã lắp ráp xong), trong khi `catbox` và `tetta` còn ở "Pha 0" — `index.astro` chỉ là placeholder (`<h1>Nền móng đã dựng xong</h1>`), chưa lắp `HeroBanner`/`PromoBanner`/`FactoryReels`/... vào trang.

Thí điểm trên `cfc` cho phép tách bạch rạch ròi: Phase 0-3 chỉ kiểm chứng **tích hợp Keystatic** (schema, auth, build), không lẫn với việc **lắp ráp UI trang chủ** (một việc code thuần, không liên quan CMS). Khi nhân rộng sang `catbox`/`tetta` ở Phase 4, việc lắp UI blocks còn thiếu sẽ được xử lý như một bước riêng trước khi áp Keystatic — dùng chính `sites/cfc/src/pages/index.astro` (sau khi đã CMS-hoá) làm mẫu tham khảo.

---

## Phase 0: Setup Keystatic Cloud & xác nhận field API (làm trên site cfc)

**Mục tiêu**: xác nhận toàn bộ chuỗi cài đặt hoạt động trước khi thiết kế schema đầy đủ.

### Task 0.1 — Tạo Keystatic Cloud team
- Đăng ký tại keystatic.com/docs/cloud, tạo 1 team (dùng email của owner dự án).
- Kết nối team với GitHub repo hiện tại (Keystatic Cloud sẽ tự xin quyền cần thiết qua GitHub App do chính Keystatic quản lý — không phải app tự tạo).
- Ghi lại `teamName` (Cloud project slug) — sẽ dùng trong `storage: {kind: 'cloud', pathPrefix: ...}`.

### Task 0.2 — Cài package vào site cfc
```
pnpm --filter @catbox/site-cfc add @keystatic/core @keystatic/astro @astrojs/react
```
Tài liệu: keystatic.com/docs/installation-astro. Lưu ý: docs chính thức dùng ví dụ với `@astrojs/markdoc` — **bỏ qua phần đó**, dự án này dùng MDX (đã có `@astrojs/mdx` sẵn trong `astro.config.mjs`), không cần thêm markdoc integration.

### Task 0.3 — Thêm integration vào `sites/cfc/astro.config.mjs`
Copy pattern chính thức từ keystatic.com/docs/installation-astro:
```js
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
// ...
integrations: [
  mdx(),
  sitemap(),
  react(),
  ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
],
```
- Dùng đúng pattern `SKIP_KEYSTATIC` từ recipe chính thức (keystatic.com/docs/recipes/astro-disable-admin-ui-in-production) **CHỈ áp dụng nếu quyết định không deploy admin UI cùng site tĩnh** — xem quyết định ở Task 0.4.
- Verify: `pnpm --filter @catbox/site-cfc dev`, mở `/keystatic`, phải thấy màn hình đăng nhập Keystatic Cloud (không phải lỗi build).

### Task 0.4 — Quyết định nơi chạy route `/keystatic`
Vì site chính build `output: 'static'` cho Cloudflare Pages, và Keystatic cần server-side code lúc admin thao tác:
- **Cách A (khuyến nghị để bắt đầu)**: route `/keystatic` chỉ chạy ở **local dev** (`pnpm dev`) — người sửa nội dung chạy `pnpm dev` trên máy họ, vào `localhost:4321/keystatic`, sửa xong Keystatic Cloud tự commit lên GitHub qua API (không cần server production nào cả). Set `SKIP_KEYSTATIC=true` khi chạy `astro build` production (Cloudflare Pages build command) để route này không có trong bundle deploy — site production hoàn toàn không đổi.
- **Cách B (nếu cửa hàng cần truy cập admin qua URL, không muốn chạy lệnh dev)**: deploy `/keystatic` như 1 route server-side riêng, cần adapter (`@astrojs/cloudflare` ở chế độ Workers, không phải Pages — theo phát hiện nghiên cứu, `@astrojs/cloudflare` bản mới đã bỏ hỗ trợ Pages). Đây là việc phức tạp hơn, để ngỏ cho Phase sau nếu Cách A không đáp ứng đủ (cửa hàng ngại cài Node.js/chạy lệnh).
- **Quyết định cho plan này: bắt đầu với Cách A.** Ghi rõ trong Phase 3 (Vận hành) hướng dẫn cụ thể để cửa hàng chạy được `pnpm dev` (hoặc cân nhắc: bạn/dev host sẵn 1 máy/service chạy `pnpm dev` liên tục nội bộ, cửa hàng truy cập qua VPN/Tailscale — chi tiết vận hành để bàn ở Phase 3, không chặn Phase 0-2).

**Verification Phase 0**: `pnpm --filter @catbox/site-cfc build` với `SKIP_KEYSTATIC=true` phải build thành công y hệt hiện tại (không route `/keystatic` trong `dist/`). `pnpm --filter @catbox/site-cfc dev` (không set biến) phải mở được `/keystatic` và đăng nhập được bằng Keystatic Cloud.

---

## Phase 1: Schema Keystatic cho collection `products` (site cfc)

**Mục tiêu**: cửa hàng tự thêm/sửa/xoá sản phẩm qua form, output khớp 100% với `productSchema` hiện có trong `packages/config/schema.ts`.

### Task 1.1 — Tạo `packages/config/keystatic-fields.ts`
File field helper dùng chung 3 site (tương tự tinh thần `schema.ts`), map 1-1 sang API Keystatic (`fields.*` từ `@keystatic/core`):

| Field trong `productSchema` (Zod) | Keystatic field tương ứng |
|---|---|
| `title: z.string()` | `fields.slug({ name: { label: 'Tên sản phẩm' } })` (tự sinh slug làm tên file) |
| `category: z.string()` | `fields.text({ label: 'Danh mục' })` (hoặc `fields.relationship` nếu Phase sau có collection `categories` riêng) |
| `material: z.array(z.string())` | `fields.array(fields.text({label:'Chất liệu'}), {label:'Chất liệu', itemLabel: (props) => props.value})` |
| `shape: z.array(z.string())` | tương tự `material` |
| `priceFrom: z.number().optional()` | `fields.number({ label: 'Giá từ', validation: { isRequired: false } })` |
| `priceLabel: z.string().optional()` | `fields.text({ label: 'Nhãn giá hiển thị' })` |
| `unit: z.string().default("chiếc")` | `fields.text({ label: 'Đơn vị', defaultValue: 'chiếc' })` |
| `moq, badge, excerpt` | `fields.text({...})` |
| `image: imageField` (optional) | `fields.image({ label: 'Ảnh chính', directory: 'src/assets/products', publicPath: '/src/assets/products/' })` — **directory phải khớp cơ chế `resolveImage()` ở `packages/ui/lib/images.ts:32`, xem Task 1.3** |
| `gallery: z.array(z.string())` | `fields.array(fields.image({directory: 'src/assets/products'}), {label:'Thư viện ảnh'})` |
| `swatches: z.array(swatchSchema)` | `fields.array(fields.object({ label: fields.text({label:'Nhãn'}), color: fields.text({label:'Mã màu hex'}), image: fields.image({...}) }), {label:'Swatches', itemLabel: (props) => props.fields.label.value})` |
| `specs: z.array(specSchema)` | `fields.array(fields.object({ label: fields.text({label:'Tên thông số'}), value: fields.text({label:'Giá trị'}) }), {label:'Thông số kỹ thuật'})` |
| `faq: z.array(faqSchema)` | `fields.array(fields.object({ q: fields.text({label:'Câu hỏi'}), a: fields.text({label:'Trả lời', multiline:true}) }), {label:'FAQ'})` |
| `bestseller, weeklyPick, draft: z.boolean()` | `fields.checkbox({ label: '...' , defaultValue: false })` |
| `order: z.number().default(999)` | `fields.number({ label: 'Thứ tự', defaultValue: 999 })` |
| `seoFields` (seoTitle, seoDescription, ogImage, noindex) | `fields.object({...})` gộp nhóm "SEO" (Keystatic hỗ trợ `fields.object` để nhóm field trong UI) |

**Tài liệu tham khảo cụ thể cần đọc lại khi code**: keystatic.com/docs/fields/array (xác nhận cú pháp `itemLabel`), keystatic.com/docs/fields/object, keystatic.com/docs/fields/relationship — vì nghiên cứu Phase 0 ghi nhận **chưa xác nhận 100% cú pháp optional cho `fields.image`** trong docs, cần thử nghiệm trực tiếp lúc code và đối chiếu README/type definition của package `@keystatic/core` (`node_modules/@keystatic/core/dist/*.d.ts` sau khi cài) làm nguồn xác thực cuối cùng thay vì đoán.

### Task 1.2 — Viết `sites/cfc/keystatic.config.ts`
```ts
import { config, collection, fields } from '@keystatic/core';
import { productFields } from '@config/keystatic-fields';

export default config({
  storage: { kind: 'cloud' },
  cloud: { project: '<teamName>/cfc' }, // từ Task 0.1
  collections: {
    products: collection({
      label: 'Sản phẩm',
      path: 'src/content/products/*',
      slugField: 'title',
      format: { contentField: 'content' },
      schema: {
        ...productFields, // toàn bộ frontmatter theo bảng Task 1.1
        content: fields.mdx({ label: 'Nội dung chi tiết' }), // phần body dưới `---`, ví dụ heading/mô tả dài trong tui-banh-mi-que-kraft.mdx
      },
    }),
  },
});
```
Lưu ý: `cfc` đã có **5 sản phẩm thật** trong `src/content/products/` (`tui-banh-mi-que-kraft.mdx`, `tui-doner-kebab.mdx`, `tui-giay-co-quai.mdx`, `giay-goi-chong-dau.mdx`, `hop-giay-dung-thuc-an.mdx`) — khác hẳn `catbox` (thư mục trống, chỉ `.gitkeep`). Trước khi test, kiểm tra các file này parse đúng qua Keystatic Admin UI (mở lên phải thấy đúng 5 sản phẩm, không lỗi) — đây là phép thử thực chất hơn hẳn so với catbox vì có dữ liệu production thật để đối chiếu, không chỉ dữ liệu test tạo mới.

Đã xác nhận thêm 2 điểm quan trọng từ việc đọc `sites/cfc/src/content.config.ts` và mẫu `tui-banh-mi-que-kraft.mdx`:
- **cfc dùng collection `categories` (schema `categorySchema`)**, không phải `industry` như `catbox` — Task 1.1 (bảng field mapping) chỉ áp dụng cho `products`; nếu Phase 1 mở rộng sang collection khác, dùng đúng tên `categories` cho site cfc, không copy nhầm tên `industry`.
- **Mỗi file sản phẩm có phần nội dung MDX body thật** bên dưới frontmatter (heading, đoạn văn mô tả) — không chỉ có `excerpt` ngắn. Điều này xác nhận Task 1.2 cần tách riêng 1 field `content` kiểu `fields.mdx` cho phần body này (không gộp vào `format.contentField: 'excerpt'` như draft ban đầu, vì `excerpt` là 1 câu ngắn trong frontmatter, khác với nội dung dài dưới `---`). Sửa `format` thành `{ contentField: 'content' }` và thêm `content: fields.mdx({ label: 'Nội dung chi tiết' })` vào schema — xem Task 1.2 đã cập nhật bên dưới.
Đối chiếu chính xác API `collection()` params (`path`, `format`, `slugField`) với keystatic.com/docs/collections trước khi code — không suy đoán tham số.

### Task 1.3 — Xác nhận tương thích ảnh với `AssetMap`
- Dữ liệu thật đã có sẵn mẫu: `tui-banh-mi-que-kraft.mdx` chứa `image: products/tui-giay.png` — nghĩa là ảnh thật hiện nằm ở `sites/cfc/src/assets/products/tui-giay.png` (theo cơ chế `resolveImage()` build key `/src/assets/${ref}`, `packages/ui/lib/images.ts:32`). **Xác nhận trước bằng lệnh** `ls sites/cfc/src/assets/products/` để chắc chắn giả định này đúng trước khi cấu hình field.
- Cấu hình `fields.image({ directory: 'src/assets/products' })` sao cho khi Keystatic mở sản phẩm `tui-banh-mi-que-kraft`, nó hiển thị đúng đúng ảnh `tui-giay.png` hiện có (không báo "ảnh không tồn tại") — đây là phép thử tương thích ngược quan trọng nhất, cụ thể hơn nhiều so với chỉ test ảnh mới upload.
- Sau đó test chiều ngược lại: upload 1 ảnh mới qua Keystatic vào field `image` của sản phẩm test, kiểm tra giá trị lưu trong file `.mdx` sinh ra có đúng dạng tương đối (`products/ten-anh.png`) khớp format hiện có không. Nếu Keystatic lưu path khác format (vd tuyệt đối, hoặc bắt đầu bằng `/`), **phải điều chỉnh `publicPath`/`directory` trong field config** cho tới khi khớp.
- Nếu không khớp được bằng config, phương án dự phòng: viết 1 dòng transform nhỏ trong `content.config.ts` (Zod `.transform()`) để chuẩn hoá path Keystatic trả về thành format `resolveImage()` cần — chỉ làm nếu bước trên thất bại.

### Task 1.4 — Verify với sản phẩm thật + 1 sản phẩm mới tạo qua UI
- Mở `/keystatic`, xác nhận cả 5 sản phẩm thật (`tui-banh-mi-que-kraft`, `tui-doner-kebab`, `tui-giay-co-quai`, `giay-goi-chong-dau`, `hop-giay-dung-thuc-an`) hiển thị đúng, không mất field, ảnh (`image: products/tui-giay.png`...) hiện đúng trong form.
- Sửa thử 1 field nhỏ trên 1 sản phẩm thật (vd đổi `priceLabel`), lưu qua Keystatic, kiểm tra diff Git — commit sinh ra chỉ đổi đúng field đó, không format lại toàn bộ file (nếu Keystatic reformat khác style hiện có — vd đổi thứ tự key, đổi cách quote — ghi nhận như một điểm cần chấp nhận hoặc điều chỉnh cấu hình `format`).
- Tạo thêm 1 sản phẩm test mới đầy đủ field (kể cả swatches/specs/faq/content) để kiểm tra luồng tạo mới hoạt động.
- Chạy `pnpm --filter @catbox/site-cfc build` — phải pass qua Zod `productSchema` validation (nếu Keystatic sinh ra field thiếu/sai kiểu so với Zod, build sẽ đỏ ngay — đây chính là lưới an toàn có sẵn, không cần thêm gì).
- Xoá sản phẩm test sau khi verify xong (không để lại rác trong `src/content/products/`); revert field đã sửa thử trên sản phẩm thật nếu không muốn giữ thay đổi đó.

**Verification Phase 1**: build xanh với dữ liệu thật (5 sản phẩm hiện có) không bị hỏng sau khi đi qua Keystatic; ít nhất 1 sản phẩm mới tạo qua UI cũng build được; file `.mdx` sinh ra đọc được đúng bởi `content.config.ts` hiện có (không cần sửa loader `glob`).

---

## Phase 2: Singleton "Homepage" & "Brand settings" (site cfc)

**Mục tiêu**: banner/hero/video và thông tin footer/liên hệ trở thành nội dung sửa được qua Keystatic, thay vì hard-code.

### Đã khảo sát thực tế `sites/cfc/src/pages/index.astro` (203 dòng, đọc toàn bộ)

Khác với giả định ban đầu, trang chủ `cfc` **đã lắp ráp đầy đủ và hoạt động** — không cần Task "lắp UI" nào cả. Cấu trúc thật (theo thứ tự trong file):

1. `HeroBanner` — props hard-code: `image="brand/hero-banner.png"`, `eyebrow`, `title`, `titleAccent="CFC"`, `subtitle`, `primaryCta`, `secondaryCta`, `hashtag` (dòng 121-131).
2. `CategoryCards` — đọc từ **content collection `categories`** thật (đã có 4 file `.mdx`, không cần CMS hoá thêm vì đã là content collection sẵn có — dòng 133-142).
3. `BestsellerGrid` — đọc từ collection `products` thật (dòng 144-149) — đã thuộc scope Phase 1.
4. `ProcessSteps` — props hard-code mảng `steps` (3 bước, dòng 62-81, 151-155).
5. `PromoBanner` — props hard-code: `image="products/hop-dung-thuc-an.png"`, `title`, `description`, CTA có nội dung động lồng `b.hotline` từ `BRANDS.cfc` (dòng 157-164).
6. `WeeklyChoice` — props hard-code mảng `hotspots` (3 điểm, dòng 108-113) + `showcaseImage="brand/hero-banner.png"` (dòng 166-172).
7. `WhyChooseUs` — props hard-code mảng `promises` (3 mục, dòng 90-106) + `image="products/hop-giay-kraft.png"` (dòng 174-182).
8. `StatsBar` — props hard-code mảng `stats` (4 số liệu, dòng 83-88, 184).
9. `NewsGrid` — đọc từ collection `blog` thật (dòng 186-195) — không cần CMS hoá thêm.
10. `FactoryReels` — props hard-code: `headline`, `image="brand/hero-banner.png"`, **chưa có `video`** (dòng 197-201) — đúng như mô tả gốc "banner/video này kia" người dùng hỏi ban đầu, đây là chỗ cụ thể cần thêm field video qua CMS.

**Kết luận phạm vi Phase 2 cho cfc**: chỉ CMS-hoá phần **props hard-code trực tiếp trong `index.astro`** (mục 1, 4, 5, 6, 7, 8, 10 ở trên) — KHÔNG đụng vào phần đã là content collection (`categories`, `products`, `blog`, đã thuộc Phase 1 hoặc ngoài scope). Ảnh dùng trong các props này đều nằm trong `sites/cfc/src/assets/{brand,products}/` — đã xác nhận tồn tại thật qua `find` (Task 1.3).

### Task 2.2 — Tạo singleton `homepage` trong `sites/cfc/keystatic.config.ts`
Field schema bám sát đúng props thật của từng component (không suy đoán), cụ thể theo Props interface đã đọc ở `packages/ui/home/*.astro`:
```ts
singletons: {
  homepage: singleton({
    label: 'Trang chủ',
    path: 'src/content/homepage/data',
    schema: {
      hero: fields.object({
        image: fields.image({ label: 'Ảnh nền', directory: 'src/assets/brand' }),
        eyebrow: fields.text({ label: 'Eyebrow', validation: { isRequired: false } }),
        title: fields.text({ label: 'Tiêu đề' }),
        titleAccent: fields.text({ label: 'Tiêu đề nhấn màu', validation: { isRequired: false } }),
        subtitle: fields.text({ label: 'Mô tả', validation: { isRequired: false } }),
        primaryCtaLabel: fields.text({ label: 'CTA chính - nhãn' }),
        primaryCtaHref: fields.text({ label: 'CTA chính - link' }),
        secondaryCtaLabel: fields.text({ label: 'CTA phụ - nhãn', validation: { isRequired: false } }),
        secondaryCtaHref: fields.text({ label: 'CTA phụ - link', validation: { isRequired: false } }),
        hashtag: fields.text({ label: 'Hashtag', validation: { isRequired: false } }),
      }),
      promo: fields.object({
        image: fields.image({ label: 'Ảnh', directory: 'src/assets/products' }),
        title: fields.text({ label: 'Tiêu đề' }),
        description: fields.text({ label: 'Mô tả', validation: { isRequired: false } }),
        // Lưu ý: CTA chính của PromoBanner hiện lồng b.hotline động (dòng 162 index.astro:
        // `label: \`📞 ${b.hotline}\`` ) — giữ nguyên phần ghép hotline trong code, KHÔNG
        // đưa hotline vào field này (hotline đã thuộc singleton brandSettings ở Task 2.4).
        secondaryCtaLabel: fields.text({ label: 'CTA phụ - nhãn' }),
        secondaryCtaHref: fields.text({ label: 'CTA phụ - link' }),
      }),
      factoryReels: fields.object({
        headline: fields.text({ label: 'Tiêu đề' }),
        image: fields.image({ label: 'Ảnh nền (poster khi chưa có video)', directory: 'src/assets/brand' }),
        video: fields.text({ label: 'Link video .mp4', validation: { isRequired: false } }),
      }),
      // steps, hotspots, promises, stats: dùng fields.array(fields.object(...))
      // theo đúng shape đang hard-code (steps: num/title/desc/cta; hotspots: x/y/title/desc/href;
      // promises: icon/title/desc; stats: num/label/highlight) — viết chi tiết lúc code,
      // đối chiếu lại index.astro dòng 62-113 để không lệch field.
    },
  }),
},
```
Đối chiếu chính xác API `singleton()` với keystatic.com/docs/singletons trước khi code (chưa được nghiên cứu chi tiết ở Phase 0 — cần 1 lượt đọc doc nhanh riêng lúc bắt tay Task này, không suy đoán params).

### Task 2.3 — Sửa `index.astro` đọc dữ liệu từ singleton
Dùng Keystatic Reader API (`createReader` từ `@keystatic/core/reader`, đọc theo keystatic.com/docs/reading-content — **cần verify chính xác API này lúc code**, vì Phase 0 nghiên cứu chưa cover Reader API) để lấy `homepage` singleton, thay thế các khối hard-code hiện có trong `index.astro` (dòng 62-116 các mảng `steps`/`stats`/`promises`/`hotspots`/`description`, và các props literal truyền thẳng vào `HeroBanner`/`PromoBanner`/`FactoryReels` ở dòng 121-131, 157-164, 197-201).

**Cách làm an toàn**: sửa từng khối một, build + xem lại trang sau mỗi lần sửa (không đổi hết 1 lượt) — vì đây là trang production đang chạy thật, không phải trang "Pha 0" trống có thể thử nghiệm tự do.

### Task 2.4 — Singleton `brandSettings` thay thế phần content-driven của `brands.ts`
- **Không xoá `brands.ts`** — giữ lại các field gắn với hạ tầng/deploy không đổi qua CMS được (`id`, `domain`, `site`, cấu trúc TypeScript `Brand` interface).
- Tạo singleton Keystatic chỉ chứa phần **nội dung cửa hàng cần tự sửa thường xuyên**: `hotline`, `zalo`, `email`, `contacts[]`, `social[]`, `certifications[]`, `promoPill`, `headerCta`, `topbarCta`.
- `brands.ts` đổi thành: đọc giá trị tĩnh (domain, id...) như cũ + merge với dữ liệu đọc từ Keystatic singleton lúc build (qua Reader API) cho phần còn lại. Cụ thể cách merge (build-time fetch trong `getBrand()` hay tại nơi gọi) quyết định lúc code, ưu tiên cách nào ít thay đổi chữ ký hàm `getBrand()` nhất để không phải sửa mọi nơi đang `import { BRANDS } from "@config/brands"`.

**Verification Phase 2**: trang chủ cfc **vẫn hiển thị y hệt trước khi CMS-hoá** (đây là tiêu chí quan trọng nhất — Phase này không được làm hỏng trang production đang chạy tốt); sửa 1 field qua `/keystatic` (vd đổi `headline` của FactoryReels, hoặc thêm `video` link) → `pnpm dev` reload thấy thay đổi ngay; `pnpm build` vẫn xanh; đối chiếu trực quan (screenshot trước/sau) để chắc chắn không lệch layout do khác field shape.

---

## Phase 3: Vận hành thực tế cho cửa hàng + tài liệu hoá

### Task 3.1 — Quyết định kênh truy cập `/keystatic` cho cửa hàng
Dựa trên kết quả thực tế Phase 0 Task 0.4 (Cách A: chạy `pnpm dev` local). Nếu cửa hàng không thể tự chạy lệnh dev:
- Phương án đơn giản nhất: bạn/dev chạy `pnpm dev` trên 1 máy luôn bật (hoặc VPS nhỏ), expose qua Tailscale/Cloudflare Tunnel để cửa hàng truy cập bằng URL cố định — không cần deploy Astro server thật, không tốn thêm chi phí hosting đáng kể.
- Ghi nhận đây là quyết định vận hành, không phải kỹ thuật — nên bàn với cửa hàng về mức độ tiện họ cần trước khi đầu tư thêm hạ tầng (Cách B ở Task 0.4).

### Task 3.2 — Viết hướng dẫn sử dụng ngắn cho cửa hàng (tiếng Việt)
Tài liệu 1 trang: cách đăng nhập Keystatic Cloud, cách thêm sản phẩm mới, cách đổi banner, cách sửa thông tin liên hệ, và **lưu ý quan trọng**: sau khi sửa xong trên `/keystatic`, đợi Cloudflare Pages build xong (vài phút) mới thấy thay đổi trên site thật — khác với thay đổi tức thời trên `/keystatic` (vốn chỉ phản ánh ngay ở môi trường dev).

### Task 3.3 — Cập nhật `docs/TECH_STACK_v2.md`
Thêm 1 mục ghi lại quyết định bổ sung Keystatic Cloud, trích dẫn đúng lý do (cửa hàng cần tự sửa) để không ai đọc lại tài liệu cũ rồi hiểu nhầm là mâu thuẫn với kết luận "không cần CMS" ở §1.

**Verification Phase 3**: 1 người ngoài (không phải dev) làm thử theo tài liệu 3.2, tự thêm được 1 sản phẩm mà không cần hỏi thêm.

---

## Phase 4: Nhân rộng sang `catbox` và `tetta`

Cả 2 site này đang ở "Pha 0" — `index.astro` mới chỉ là placeholder (`<h1>Nền móng đã dựng xong</h1>`), khác hẳn `cfc` đã chạy thật. Vì vậy nhân rộng gồm 2 phần việc tách bạch rõ ràng:

### Task 4.1 — Lắp UI blocks vào `index.astro` (việc code thuần, làm TRƯỚC, không phụ thuộc Keystatic)
Dùng chính `sites/cfc/src/pages/index.astro` (đã khảo sát chi tiết ở Phase 2) làm mẫu tham khảo cấu trúc — copy cách gọi `HeroBanner`/`CategoryCards`/`BestsellerGrid`/`ProcessSteps`/`PromoBanner`/`WeeklyChoice`/`WhyChooseUs`/`StatsBar`/`NewsGrid`/`FactoryReels`, nhưng nội dung (title, ảnh, steps, stats, promises, hotspots...) phải soạn riêng theo đúng brand — **không copy nguyên nội dung F&B của cfc sang catbox/tetta**. Ảnh dùng tạm có thể lấy từ hệ thống placeholder sẵn có (`pnpm gen:placeholder`, xem `DEVELOPMENT.md`) nếu chưa có ảnh thật.
- `catbox` dùng collection `industry` thay cho `categories` (đã ghi trong `content.config.ts` gốc) — `CategoryCards`/tương đương cần đọc đúng collection này, không phải `categories` như cfc.
- `tetta` dùng schema nào cho danh mục cần kiểm tra lại `sites/tetta/src/content.config.ts` lúc bắt tay task này (chưa khảo sát trong plan này — không giả định giống catbox hay cfc).
- Verify: trang chủ build và hiển thị đầy đủ khối, không còn placeholder "Pha 0", trước khi sang Task 4.2.

### Task 4.2 — Áp Keystatic (lặp lại Phase 0-2)
Tái sử dụng field helpers từ `packages/config/keystatic-fields.ts` (đã viết ở Task 1.1) — chỉ cần viết `keystatic.config.ts` riêng cho từng site (path/collection tương ứng thư mục content của site đó, chú ý tên collection khác nhau giữa 3 site — xem Task 4.1) và lắp singleton `homepage`/`brandSettings` riêng theo nội dung/props thật của từng brand (đọc lại `index.astro` của từng site sau khi hoàn thành Task 4.1, đừng copy schema singleton của cfc nguyên xi vì props/nội dung khác nhau).

Mỗi site verify độc lập theo checklist Phase 0-3 trước khi coi là xong.

---

## Rủi ro tồn đọng cần theo dõi

1. **Reader API và `singleton()` params chưa được nghiên cứu chi tiết trong Phase 0** — Task 2.2/2.3 cần một lượt đọc docs riêng (keystatic.com/docs/singletons, /docs/reading-content) ngay khi bắt đầu code, không suy đoán cú pháp.
2. **`fields.image` optional syntax chưa xác nhận 100%** — verify bằng type definitions thực tế trong `node_modules/@keystatic/core` sau khi cài, không chỉ dựa vào docs.
3. **Nếu Cách A (chạy dev local) không đủ tiện cho cửa hàng**, Cách B (deploy admin route server-side riêng) sẽ cần nghiên cứu bổ sung về Cloudflare Workers adapter — chưa nằm trong scope plan này.
4. Nếu khối lượng ảnh sản phẩm lớn, cân nhắc nâng Keystatic Cloud lên Pro để dùng Cloud Images thay vì commit ảnh thẳng vào Git repo (repo phình to dần theo thời gian nếu không).
5. **Rủi ro reformat file khi Keystatic ghi lại** (phát hiện ở Task 1.4): Keystatic có thể ghi lại frontmatter/MDX theo style riêng (thứ tự key, cách quote chuỗi) khác với 5 file sản phẩm thật hiện có của `cfc` — cần kiểm tra diff Git kỹ sau lần lưu đầu tiên qua UI, chấp nhận nếu chỉ là khác style vô hại, nhưng phải chặn lại nếu làm sai lệch dữ liệu (vd đổi thứ tự phần tử trong mảng `specs`/`faq` ảnh hưởng thứ tự hiển thị).
6. **`sites/tetta/src/content.config.ts` chưa được khảo sát trong plan này** — Task 4.1 cần đọc file này trước khi giả định cấu trúc collection giống catbox hay cfc.

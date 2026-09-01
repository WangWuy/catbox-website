import { z } from "astro:content";

/**
 * Schema Zod dùng chung cho cả 3 site.
 *
 * Nguyên tắc §4 TECH_STACK_v2: ảnh/video khách gửi SAU → mọi field ảnh đều
 * optional, component tự rơi về placeholder theo brand. Build phải xanh khi
 * chưa có một tấm ảnh thật nào.
 */

/** Ảnh: đường dẫn tương đối trong `public/` hoặc `src/assets/`. Optional. */
const imageField = z.string().optional();

/** SEO override — mọi collection đều có, dùng cho <SEOHead> */
export const seoFields = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().max(165).optional(),
  ogImage: imageField,
  noindex: z.boolean().default(false),
};

/** Toạ độ hotspot (%) — dùng cho khối "Lựa chọn của tuần" */
export const hotspotSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  title: z.string(),
  desc: z.string().optional(),
  href: z.string().optional(),
});

/** Swatch chọn màu / chất liệu trên ProductCard + ProductGallery */
export const swatchSchema = z.object({
  label: z.string(),
  /** Mã hex hiển thị ô vuông swatch */
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  /** Ảnh sẽ đổi sang khi chọn swatch này */
  image: imageField,
});

/** Một dòng trong bảng thông số kỹ thuật — cũng là mồi GEO (§6B) */
export const specSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const faqSchema = z.object({
  q: z.string(),
  a: z.string(),
});

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export const productSchema = z.object({
  title: z.string(),
  /**
   * Slug của file trong collection `categories` (KHÔNG phải tên hiển thị) —
   * Keystatic `fields.relationship` ghi ra slug. Tên hiển thị lấy qua
   * `categoryTitle()` trong `packages/config/categories.ts`, không đọc thẳng
   * field này ra UI.
   */
  category: z.string(),
  /** Dùng cho filter island — lọc bằng URL query param */
  material: z.array(z.string()).default([]),
  shape: z.array(z.string()).default([]),
  moq: z.string().optional(),
  /** Mã sản phẩm (SKU) hiển thị cạnh tên sản phẩm trên trang chi tiết */
  sku: z.string().optional(),
  badge: z.string().optional(),
  excerpt: z.string().optional(),
  image: imageField,
  gallery: z.array(z.string()).default([]),
  swatches: z.array(swatchSchema).default([]),
  specs: z.array(specSchema).default([]),
  faq: z.array(faqSchema).default([]),
  bestseller: z.boolean().default(false),
  weeklyPick: z.boolean().default(false),
  order: z.number().default(999),
  draft: z.boolean().default(false),
  ...seoFields,
});

export const categorySchema = z.object({
  title: z.string(),
  /**
   * Tên ngắn để nhét vào câu điều hướng, ví dụ tiêu đề khối trong sidebar
   * ("LOẠI TÚI GIẤY"). `title` là tên đầy đủ trên hero/menu nên thường quá dài
   * hoặc có ký tự ghép ("CỐC GIẤY & ỐNG HÚT", "Túi bánh mì / Bao bánh mì") —
   * ghép thẳng vào câu sẽ lủng củng. Bỏ trống thì fallback về `title`.
   */
  navLabel: z.string().optional(),
  /** Phụ đề nhỏ dưới tên danh mục trên CategoryCards */
  sub: z.string().optional(),
  description: z.string().optional(),
  image: imageField,
  /**
   * Tên icon Iconify hiển thị trên CategoryNav (ví dụ `lucide:shopping-bag`).
   * Trước đây hardcode trong `nav.ts`; giờ khách tự chọn qua Keystatic.
   * Keystatic ghi `""` khi khách chọn "Không có icon" — quy về `undefined` để
   * component không truyền chuỗi rỗng vào `<Icon name>` (làm hỏng build).
   */
  icon: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  /**
   * Slug danh mục cha — cây 3 tầng theo sitemap CFC
   * (Túi giấy thực phẩm → Túi bánh mì → Bao bánh mì que).
   * Bỏ trống = danh mục gốc, tức mục hiện trên thanh CategoryNav.
   * `fields.relationship` ghi `null` khi bỏ trống, nên phải nhận cả null.
   */
  parent: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  /** Ẩn khỏi CategoryNav nhưng trang `/danh-muc/<slug>` vẫn build (giữ link cũ) */
  hideFromNav: z.boolean().default(false),
  draft: z.boolean().default(false),
  order: z.number().default(999),
  ...seoFields,
});

export const caseStudySchema = z.object({
  title: z.string(),
  client: z.string(),
  industry: z.string().optional(),
  summary: z.string(),
  date: z.coerce.date(),
  cover: imageField,
  gallery: z.array(z.string()).default([]),
  results: z.array(specSchema).default([]),
  draft: z.boolean().default(false),
  ...seoFields,
});

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  author: z.string().default("Catbox Group"),
  tags: z.array(z.string()).default([]),
  cover: imageField,
  faq: z.array(faqSchema).default([]),
  draft: z.boolean().default(false),
  ...seoFields,
});

export const policySchema = z.object({
  title: z.string(),
  updated: z.coerce.date(),
  order: z.number().default(999),
  ...seoFields,
});

/** Catbox có thêm collection Industry (5 lĩnh vực) */
export const industrySchema = z.object({
  title: z.string(),
  summary: z.string(),
  icon: z.string().optional(),
  image: imageField,
  order: z.number().default(999),
  ...seoFields,
});

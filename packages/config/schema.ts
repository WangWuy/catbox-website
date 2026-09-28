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
  material: z
    .array(z.string().nullable())
    .transform((arr) => arr.filter((x): x is string => typeof x === "string" && x.trim().length > 0))
    .default([]),
  shape: z
    .array(z.string().nullable())
    .transform((arr) => arr.filter((x): x is string => typeof x === "string" && x.trim().length > 0))
    .default([]),
  moq: z.string().optional(),
  /** Mã sản phẩm (SKU) hiển thị cạnh tên sản phẩm trên trang chi tiết */
  sku: z.string().optional(),
  badge: z.string().optional(),
  excerpt: z.string().optional(),
  image: imageField,
  gallery: z
    .array(z.string().nullable())
    .transform((arr) => arr.filter((x): x is string => typeof x === "string" && x.trim().length > 0))
    .default([]),
  swatches: z.array(swatchSchema).default([]),
  specs: z.array(specSchema).default([]),
  faq: z.array(faqSchema).default([]),
  bestseller: z.boolean().default(false),
  weeklyPick: z.boolean().default(false),
  order: z
    .union([z.number(), z.nan()])
    .transform((v) => (Number.isNaN(v) ? 999 : v))
    .default(999),
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
  /**
   * Tên ngắn cho cột chính sách ở chân trang. Cùng lý do với
   * `categorySchema.navLabel`: tiêu đề đầy đủ ("Chính sách đổi trả & bảo hành")
   * đúng cho đầu trang nhưng dài quá cho một cột link hẹp. Bỏ trống thì dùng
   * `title`.
   */
  navLabel: z.string().optional(),
  updated: z.coerce.date(),
  /**
   * Icon trên thẻ ở trang /chinh-sach. Trước đây là một map slug → icon nằm
   * cứng trong `chinh-sach.astro`: khách đổi tên chính sách là slug đổi theo và
   * thẻ lặng lẽ rơi về icon mặc định. Để icon đi cùng bản ghi thì đổi tên bao
   * nhiêu lần cũng không mất.
   *
   * Keystatic ghi `""` khi khách chọn "Không có icon" — quy về `undefined` để
   * component không truyền chuỗi rỗng vào `<Icon name>` (làm hỏng build).
   */
  icon: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  order: z.number().default(999),
  draft: z.boolean().default(false),
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

/**
 * Trang do khách TỰ TẠO qua CMS (Khuyến mãi, Tuyển dụng...), render bởi route
 * catch-all `/[...slug]`.
 *
 * Đây là chỗ duy nhất dùng MDX cho nội dung trang — khác các trang cố định
 * (dùng singleton JSON, xem `packages/config/pages.ts`). Lý do: trang khách tự
 * tạo là văn xuôi tự do, không có cấu trúc định trước để dựng form.
 */
export const pageSchema = z.object({
  title: z.string(),
  /** Đoạn dẫn dưới tiêu đề — cũng là mô tả SEO mặc định */
  description: z.string().optional(),
  updated: z.coerce.date().optional(),
  /** Hiện trong menu chân trang */
  showInNav: z.boolean().default(false),
  /** Tên ngắn dùng trên menu; bỏ trống thì lấy `title` */
  navLabel: z.string().optional(),
  order: z.number().default(999),
  draft: z.boolean().default(false),
  ...seoFields,
});

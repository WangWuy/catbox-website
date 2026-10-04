import { z } from "zod";
import { parseData } from "./parse";

/**
 * Schema cho nội dung TỪNG TRANG cố định — thứ trước đây nằm cứng trong
 * `.astro` dưới dạng props literal và mảng khai tại chỗ.
 *
 * Mỗi schema ở đây map 1-1 với một `singleton` Keystatic (xem
 * `keystatic-fields.ts`) và một file JSON trong
 * `sites/<site>/src/content/pages-data/`.
 *
 * Vì sao là singleton JSON chứ không phải content collection MDX: nội dung
 * những trang này gần như toàn bộ là **dữ liệu có cấu trúc** (mảng số liệu,
 * mảng bước quy trình, cặp câu hỏi–trả lời) chứ không phải văn xuôi dài. Nhét
 * vào MDX thì khách phải tự giữ đúng cấu trúc bằng tay; còn form Keystatic
 * dựng từ schema thì không sai được. Trang khách TỰ TẠO mới dùng MDX — xem
 * collection `pages`.
 *
 * Vì sao dùng `zod` thẳng chứ không lấy `z` từ `astro:content` như `schema.ts`:
 * xem chú thích đầu `settings.ts`.
 */

/** Cặp nhãn + link cho nút CTA */
const cta = z.object({
  label: z.string(),
  href: z.string(),
});

/**
 * SEO của một trang cố định.
 *
 * Khác `seoFields` trong `schema.ts` ở chỗ `description` là BẮT BUỘC: với
 * content collection, mô tả có thể suy ra từ `excerpt`/`description` của bản
 * ghi, còn trang cố định thì không có gì để suy ra — bỏ trống là trang lên
 * Google không có dòng mô tả.
 */
const seo = z.object({
  title: z.string(),
  description: z.string(),
});

/** Một ô số liệu hoặc danh mục đại diện trên hero trang chủ */
const heroStat = z.object({
  icon: z.string(),
  num: z.string().optional(),
  label: z.string(),
  href: z.string().optional(),
});

/** Đối tác thương hiệu trong dải logo */
const partnerItem = z.object({
  name: z.string(),
  logo: z.string().optional(),
  logoUrl: z.string().optional(),
  href: z.string().optional(),
});

export const homepageSchema = z.object({
  seo,
  hero: z.object({
    image: z.string().optional(),
    eyebrow: z.string().optional(),
    title: z.string(),
    /** Phần tiêu đề được tô màu nhấn, nối ngay sau `title` */
    titleAccent: z.string().optional(),
    subtitle: z.string().optional(),
    /** Phần đuôi của dòng "#nhận nhiều ..." */
    hashtag: z.string().optional(),
    /** Nút CTA trên banner ("Liên hệ" trỏ tới /contact) */
    cta: cta.default({ label: "Liên hệ", href: "/contact" }),
    stats: z.array(heroStat).default([]),
  }),
  /** Dải logo các thương hiệu đối tác */
  partners: z.array(partnerItem).default([]),
  bestsellers: z.object({
    title: z.string(),
    /** Số sản phẩm bán chạy tối đa hiện trên trang chủ */
    limit: z.number().int().positive().default(10),
  }),
  news: z.object({
    title: z.string(),
    action: cta,
    limit: z.number().int().positive().default(3),
  }),
  /** Khối video trước Footer */
  reels: z.object({
    /** Mô tả cho trình đọc màn hình — không hiển thị trên trang */
    label: z.string(),
    video: z.string().optional(),
    poster: z.string().optional(),
  }),
});

export type Homepage = z.infer<typeof homepageSchema>;

export const parseHomepage = (raw: unknown): Homepage =>
  parseData("Trang chủ", homepageSchema, raw);

/**
 * Từ vựng bộ lọc + nhãn dùng chung cho MỌI trang có lưới sản phẩm:
 * `/products`, `/danh-muc/<slug>` và khối "Bán chạy" ở trang chủ.
 *
 * Gom về một chỗ vì trước đây `MATERIAL_LABEL` và `SHAPE_LABEL` được chép
 * NGUYÊN SI ở cả `products/index.astro` lẫn `danh-muc/[...slug].astro`, còn
 * `swatchNote` lặp ở ba trang. Thêm một chất liệu mới mà chỉ sửa một file thì
 * hai trang hiển thị hai bộ lọc khác nhau — lỗi im lặng, không ai báo.
 *
 * `value` là giá trị thật trong frontmatter sản phẩm (`material`, `shape`),
 * `label` là chữ hiện cho khách. Đổi `value` là mọi sản phẩm đang gắn giá trị
 * cũ rơi khỏi bộ lọc, nên phần này để khách sửa `label` là chính.
 */
const filterOption = z.object({
  value: z.string(),
  label: z.string(),
});

export const catalogSchema = z.object({
  seo,
  /** Tiêu đề lớn trên PageHero của /products */
  heroTitle: z.string(),
  heroImage: z.string().optional(),
  /** Ảnh nền mặc định cho trang danh mục chưa đặt ảnh riêng */
  categoryFallbackImage: z.string().optional(),
  /** Tên khối trong JSON-LD CollectionPage */
  collectionName: z.string(),
  materialLabel: z.string(),
  materials: z.array(filterOption).default([]),
  shapeLabel: z.string(),
  shapes: z.array(filterOption).default([]),
  /** Dòng chú thích nhỏ dưới dãy swatch trên mỗi thẻ sản phẩm */
  swatchNote: z.string().optional(),
});

export type Catalog = z.infer<typeof catalogSchema>;

export const parseCatalog = (raw: unknown): Catalog =>
  parseData("Trang sản phẩm", catalogSchema, raw);

/** `[{value,label}]` → `Record<value, label>`, dạng các trang đang dùng để dựng bộ lọc */
export const labelMap = (options: { value: string; label: string }[]): Record<string, string> =>
  Object.fromEntries(options.map((o) => [o.value, o.label]));

/** Tiêu đề khối kiểu SectionHeader: phần thường + phần tô màu nhấn */
const heading = z.object({
  title: z.string(),
  accent: z.string().optional(),
});

const imageWithAlt = z.object({
  src: z.string().optional(),
  /**
   * Mặc định chuỗi rỗng chứ không phải `undefined`: `SmartImage` bắt buộc có
   * `alt`, và chuỗi rỗng là cách khai báo đúng cho ảnh trang trí. Khách bỏ
   * trống thì ảnh được coi là trang trí, không phải là thiếu dữ liệu.
   */
  alt: z.string().default(""),
});

/** Khối video FactoryReels — lặp ở trang chủ và trang giới thiệu */
const reels = z.object({
  label: z.string(),
  video: z.string().optional(),
  poster: z.string().optional(),
});

export const aboutSchema = z.object({
  seo,
  hero: z.object({
    title: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
  overview: heading.extend({
    body: z.string(),
    images: z.array(imageWithAlt).default([]),
  }),
  /** Tầm nhìn / Sứ mệnh — hai thẻ lật */
  purpose: heading.extend({
    items: z
      .array(
        z.object({
          icon: z.string(),
          title: z.string(),
          body: z.string(),
          tone: z.enum(["primary", "eco"]).optional(),
        }),
      )
      .default([]),
  }),
  /**
   * Giá trị cốt lõi. `CoreValues` xếp các mục theo toạ độ ngũ giác cố định nên
   * quá 5 mục là mục thứ 6 rơi vào giữa tâm — giới hạn ngay ở schema để khách
   * biết trước thay vì phát hiện lúc nhìn trang vỡ.
   */
  coreValues: heading.extend({
    items: z
      .array(
        z.object({
          title: z.string(),
          tagline: z.string().optional(),
          desc: z.string(),
        }),
      )
      .max(5, "Tối đa 5 giá trị cốt lõi — sơ đồ ngũ giác chỉ có 5 đỉnh.")
      .default([]),
  }),
  strategicGoals: z.object({
    title: z.string(),
    /** Nhiều từ thì hiệu ứng gõ chữ luân phiên từng từ */
    accent: z.array(z.string()).default([]),
    label: z.string(),
    items: z
      .array(
        z.object({
          title: z.string().optional(),
          desc: z.string(),
          tone: z.enum(["primary", "eco"]).optional(),
        }),
      )
      .default([]),
  }),
  video: heading.extend({ reels }),
  sections: heading.extend({
    items: z
      .array(
        z.object({
          num: z.string().optional(),
          icon: z.string().optional(),
          title: z.string(),
          desc: z.string(),
          href: z.string(),
        }),
      )
      .default([]),
  }),
});

export type About = z.infer<typeof aboutSchema>;

export const parseAbout = (raw: unknown): About =>
  parseData("Trang giới thiệu", aboutSchema, raw);

/** Nút CTA đóng khối cuối trang — lặp ở nhiều trang tĩnh */
const ctaBlock = z.object({
  title: z.string(),
  body: z.string(),
  action: cta,
});

/** Tiêu đề + đoạn dẫn mở đầu một trang tĩnh không có PageHero ảnh */
const pageIntro = z.object({
  title: z.string(),
  body: z.string(),
});

export const capacitySchema = z.object({
  seo,
  /** Nhãn breadcrumb của trang cha, ví dụ "Về chúng tôi" */
  parentCrumb: cta,
  intro: pageIntro,
  /** Nhãn cho trình đọc màn hình của khối danh sách dây chuyền */
  linesLabel: z.string(),
  /** Nhãn nhỏ trên danh sách "phù hợp với" của mỗi dây chuyền */
  suitedLabel: z.string(),
  lines: z
    .array(
      z.object({
        icon: z.string(),
        name: z.string(),
        tagline: z.string(),
        specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
        suited: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  cta: ctaBlock,
});

export type Capacity = z.infer<typeof capacitySchema>;

export const parseCapacity = (raw: unknown): Capacity =>
  parseData("Trang năng lực sản xuất", capacitySchema, raw);

export const notFoundSchema = z.object({
  seo,
  code: z.string(),
  title: z.string(),
  body: z.string(),
  actions: z.array(cta).default([]),
});

export type NotFound = z.infer<typeof notFoundSchema>;

export const parseNotFound = (raw: unknown): NotFound =>
  parseData("Trang 404", notFoundSchema, raw);

/**
 * Link có thể chưa có (Shopee / TikTok Shop chưa mở gian hàng). Nhận cả `null`
 * vì Keystatic ghi `null` cho ô text bỏ trống — cùng cách xử lý với
 * `categorySchema.parent`. Mục không có link render thành chữ tĩnh, không ra
 * thẻ <a> rỗng.
 */
const optionalHref = z
  .string()
  .nullish()
  .transform((v) => (v ? v : undefined));

/** Nhãn màu nhỏ cạnh một dòng — hai tông đang dùng trên trang quy trình */
const badgeTone = z.enum(["primary", "cta"]).default("primary");

export const processSchema = z.object({
  seo,
  parentCrumb: cta,
  intro: pageIntro,
  /** Nhãn cho trình đọc màn hình của khối hai luồng khách */
  flowsLabel: z.string(),
  flows: z
    .array(
      z.object({
        icon: z.string(),
        title: z.string(),
        tagline: z.string(),
        body: z.string().optional(),
        channelsLabel: z.string().optional(),
        channels: z
          .array(
            z.object({
              label: z.string(),
              icon: z.string(),
              href: optionalHref,
            }),
          )
          .default([]),
        /** Nhánh con của luồng (ví dụ "chưa có design" / "đã có design") */
        branches: z
          .array(
            z.object({
              icon: z.string(),
              title: z.string(),
              body: z.string().optional(),
              items: z
                .array(
                  z.object({
                    label: z.string(),
                    badge: z.string().optional(),
                    badgeTone,
                    desc: z.string(),
                  }),
                )
                .default([]),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
  steps: z.object({
    title: z.string(),
    body: z.string(),
    items: z
      .array(z.object({ num: z.string(), title: z.string(), desc: z.string() }))
      .default([]),
  }),
  cta: ctaBlock,
});

export type Process = z.infer<typeof processSchema>;

export const parseProcess = (raw: unknown): Process =>
  parseData("Trang quy trình", processSchema, raw);

export const contactSchema = z.object({
  seo,
  hero: z.object({
    title: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
  /**
   * Thẻ địa điểm. Địa chỉ, giờ làm việc và ảnh KHÔNG nằm ở đây — chúng đọc từ
   * "Cài đặt" (`settings.locations`) để trang liên hệ, Footer và dữ liệu gửi
   * Google không bao giờ nói khác nhau. Ở đây chỉ còn nhãn của các dòng liên hệ
   * thuộc riêng cách bày trang này.
   */
  places: z
    .object({
      /** Nhãn dòng hotline trên thẻ cơ sở đầu tiên */
      hotlineLabel: z.string(),
      /** Nhãn cho từng nhân viên sale trên các thẻ cơ sở còn lại */
      salesLabels: z.array(z.string()).default([]),
    })
    .optional(),
  trust: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string(),
      titleColor: z.string().optional(),
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      stats: z
        .array(
          z.object({
            num: z.string(),
            label: z.string(),
            color: z.string().optional(),
            highlight: z.boolean().optional(),
          }),
        )
        .default([]),
      body: z.array(z.string()).default([]),
      cta: z
        .object({
          label: z.string(),
          href: z.string(),
        })
        .optional(),
    })
    .optional(),
  form: z.object({ title: z.string() }),
  faq: z.object({
    title: z.string(),
    items: z
      .array(z.object({ q: z.string(), a: z.array(z.string()).default([]) }))
      .default([]),
  }),
  company: z.object({
    blocks: z
      .array(z.object({ title: z.string(), body: z.array(z.string()).default([]) }))
      .default([]),
  }),
  /** Phần dữ liệu chỉ gửi cho Google, không hiện trên trang */
  business: z.object({
    priceRange: z.string(),
    /** Tên ngày theo chuẩn schema.org — phải khớp với dòng giờ làm việc hiển thị */
    openingDays: z.array(z.string()).default([]),
  }),
});

export type Contact = z.infer<typeof contactSchema>;

export const parseContact = (raw: unknown): Contact =>
  parseData("Trang liên hệ", contactSchema, raw);

/**
 * Nội dung dùng chung cho MỌI trang thuộc mục Tin tức: danh sách, trang thẻ,
 * khối cuối bài viết và feed RSS.
 *
 * Gom về một chỗ vì mô tả blog trước đây được chép NGUYÊN SI ở cả
 * `blog/index.astro` lẫn `rss.xml.ts`, còn ảnh nền lặp ở ba trang.
 */
export const blogPageSchema = z.object({
  seo,
  heroTitle: z.string(),
  heroImage: z.string().optional(),
  /** Nhãn "Tin tức" trên đường dẫn của trang con */
  crumbLabel: z.string(),
  /**
   * Tiêu đề trang thẻ. `{tag}` được thay bằng tên thẻ.
   */
  tagTitleTemplate: z.string(),
  /**
   * Mô tả trang thẻ. `{tag}` → tên thẻ, `{count}` → số bài viết.
   */
  tagDescriptionTemplate: z.string(),
  backToAll: z.string(),
  relatedTitle: z.string(),
  /** Khối kêu gọi cuối mỗi bài viết */
  postCta: z.object({
    title: z.string(),
    body: z.string(),
    action: cta,
  }),
  /** Đuôi nối sau tên thương hiệu làm tiêu đề feed RSS */
  rssTitleSuffix: z.string(),
});

export type BlogPage = z.infer<typeof blogPageSchema>;

export const parseBlogPage = (raw: unknown): BlogPage =>
  parseData("Trang tin tức", blogPageSchema, raw);

/**
 * Thay `{tag}` / `{count}` trong câu mẫu của trang thẻ.
 *
 * Dùng dấu ngoặc nhọn thay vì template literal vì câu mẫu do khách gõ trong
 * CMS — không thể là code. Token nào không truyền thì giữ nguyên trên trang,
 * để khách nhìn ra mình gõ sai tên token chứ không lặng lẽ mất chữ.
 */
export const fillTemplate = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (whole, key) =>
    key in values ? String(values[key]) : whole,
  );

export const policiesPageSchema = z.object({
  seo,
  parentCrumb: cta,
  intro: pageIntro,
  /** Nhãn cho trình đọc màn hình của lưới thẻ chính sách */
  listLabel: z.string(),
});

export type PoliciesPage = z.infer<typeof policiesPageSchema>;

export const parsePoliciesPage = (raw: unknown): PoliciesPage =>
  parseData("Trang chính sách", policiesPageSchema, raw);

/**
 * Nội dung `/llms.txt` — bản tóm tắt doanh nghiệp dành cho trợ lý AI đọc.
 *
 * Trước đây là file tĩnh trong `public/` chép tay lại toàn bộ marketing copy:
 * nó vẫn ghi hotline giả `0909.xxx.xxx` và trỏ tới `/bang-gia-si`, một trang
 * không tồn tại. Sinh lúc build từ cùng nguồn với trang web thì không lệch được
 * nữa. Pháp nhân, địa chỉ, hotline, chứng nhận, số liệu, nhóm sản phẩm và hệ
 * sinh thái đều tự lấy — ở đây chỉ còn phần văn xuôi.
 */
export const llmsSchema = z.object({
  /** Dòng tiêu đề đầu file — mô tả doanh nghiệp bằng một cụm ngắn */
  headline: z.string(),
  summary: z.string(),
  sections: z.object({
    capacity: z.string(),
    products: z.string(),
    ordering: z.string(),
    policies: z.string(),
    ecosystem: z.string(),
    links: z.string(),
  }),
  capacity: z.array(z.string()).default([]),
  ordering: z.array(z.string()).default([]),
  policies: z.array(z.string()).default([]),
  links: z.array(cta).default([]),
});

export type Llms = z.infer<typeof llmsSchema>;

export const parseLlms = (raw: unknown): Llms => parseData("Tóm tắt cho AI", llmsSchema, raw);

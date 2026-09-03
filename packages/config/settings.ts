import { z } from "zod";
import { parseData } from "./parse";

/**
 * Phần NỘI DUNG của mỗi thương hiệu — khách sửa được qua Keystatic.
 *
 * Vì sao tách khỏi `brands.ts`: `brands.ts` trộn hai loại dữ liệu khác hẳn nhau
 * về vòng đời. `domain`, `themeColor`, `favicon`, `locales` gắn với hạ tầng và
 * chỉ đổi khi dev đổi deploy; còn hotline, địa chỉ, danh sách sale, mạng xã hội
 * thì khách đổi bất cứ lúc nào và trước nay phải nhờ dev sửa code. File này giữ
 * đúng nhóm thứ hai.
 *
 * Vì sao import `zod` thẳng chứ không lấy `z` từ `astro:content` như
 * `schema.ts`: `brands.ts` được import bởi hàng chục component và cả
 * `keystatic.config.ts` — kéo `astro:content` vào đó là buộc mọi nơi phải chạy
 * trong ngữ cảnh Astro. `schema.ts` thì bắt buộc dùng `z` của `astro:content`
 * vì nó khai schema cho content collection.
 *
 * Dữ liệu thật nằm ở `packages/config/data/<brand>.json`, do Keystatic ghi ra
 * (xem `settingsFields()` trong `keystatic-fields.ts` — map 1-1 với schema này).
 */

const cta = z.object({
  label: z.string(),
  href: z.string(),
});

/** Một ô số liệu năng lực ("10+" / "Năm kinh nghiệm") */
const stat = z.object({
  num: z.string(),
  label: z.string(),
  /** Tô màu CTA cho con số muốn nhấn */
  highlight: z.boolean().default(false),
});

/** Nhân viên tư vấn bán hàng — hiển thị ở cột 2 Footer, bấm mở Zalo */
const salesRep = z.object({
  name: z.string(),
  phone: z.string(),
});

/**
 * Một cơ sở (nhà máy / văn phòng) — địa chỉ TÁCH THÀNH PHẦN, không phải một
 * chuỗi liền.
 *
 * Trước đây địa chỉ bị chép tay ở ba nơi với ba định dạng khác nhau:
 * `SHARED_CONTACTS` trong brands.ts (một chuỗi), `JsonLd.astro` (PostalAddress
 * tách phần), và `contact.astro` (vừa chuỗi hiển thị vừa PostalAddress). Sửa
 * địa chỉ ở một nơi mà quên hai nơi kia là lỗi chờ sẵn. Tách thành phần ở đây
 * để JSON-LD lấy đúng `streetAddress`/`addressLocality`, còn chỗ nào cần chuỗi
 * hiển thị thì ghép qua `formatAddress()`.
 */
const location = z.object({
  icon: z.string(),
  /** "Nhà máy" / "Văn phòng" */
  label: z.string(),
  streetAddress: z.string(),
  locality: z.string(),
  country: z.string().default("VN"),
  hours: z
    .object({
      days: z.string(),
      opens: z.string(),
      closes: z.string(),
    })
    .optional(),
  /** Ảnh cơ sở — optional, component tự rơi về placeholder (§4 TECH_STACK_v2) */
  image: z.string().optional(),
});

/**
 * Một mục trên thanh menu chính.
 *
 * `isMega` đánh dấu mục mở mega-menu sản phẩm. Cây danh mục bên trong KHÔNG
 * khai ở đây — nó dựng từ collection `categories` lúc build, nên khách thêm đầu
 * mục sản phẩm là menu tự có, không phải vào sửa lại chỗ này.
 */
const navEntry = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  isMega: z.boolean().default(false),
});

export const settingsSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  legalName: z.string(),
  /** Dòng bảo chứng dưới logo (Catbox là brand mẹ nên không có) */
  memberOf: z.string().optional(),

  hotline: z.string(),
  /** `tel:` của hotline — tách riêng vì hotline hiển thị có dấu chấm/khoảng trắng */
  hotlineHref: z.string(),
  zalo: z.string(),
  email: z.string(),

  searchPlaceholder: z.string(),
  /** Pill khuyến mãi bên phải CategoryNav */
  promoPill: z.string(),
  /** Nhãn nút pill xám ở MainHeader (§3 TECH_STACK_v2) */
  headerCta: cta,
  /** CTA nhỏ trên Topbar — phải khác headerCta để không lặp chữ hai lần */
  topbarCta: cta,

  certifications: z.array(z.string()).default([]),
  /**
   * Số liệu năng lực — dùng ở StatsBar (/about-us) và khối cam kết trước form
   * (/contact). Để ở đây thay vì khai trong từng trang vì hai nơi phải khớp
   * nhau: số lệch giữa hai trang là mồi GEO sai.
   */
  stats: z.array(stat).default([]),
  locations: z.array(location).default([]),
  salesReps: z.array(salesRep).default([]),
  /** Hotline phản ánh dịch vụ — tách khỏi hotline bán hàng */
  serviceHotlines: z.array(z.string()).default([]),
  social: z.array(cta).default([]),

  footer: z.object({
    /** Khối đăng ký nhận bản tin ở cột 3 */
    newsletterTitle: z.string(),
    newsletterDesc: z.string(),
    /** Dòng điều khoản thanh toán / giao hàng dưới cột 2 */
    terms: z.string().optional(),
  }),

  nav: z.object({
    /** Link phụ trên thanh trên cùng, cạnh hotline */
    topbarLinks: z.array(cta).default([]),
    /** Các mục trên thanh menu chính */
    entries: z.array(navEntry).default([]),
  }),
});

export type BrandSettings = z.infer<typeof settingsSchema>;
export type BrandNavEntry = z.infer<typeof navEntry>;
export type BrandLocation = z.infer<typeof location>;
export type BrandStat = z.infer<typeof stat>;
export type SalesRep = z.infer<typeof salesRep>;

/** Đọc file settings JSON của một brand — xem `parseData()` cho lý do kiểm tra */
export const parseSettings = (brand: string, raw: unknown): BrandSettings =>
  parseData(`Cài đặt ${brand} (packages/config/data/${brand}.json)`, settingsSchema, raw);

/** Ghép địa chỉ thành chuỗi một dòng để hiển thị: "KCN Đồng Văn, Duy Tiên, Hà Nam" */
export const formatAddress = (l: BrandLocation): string =>
  `${l.streetAddress}, ${l.locality}`;

/** Ghép giờ làm việc thành chuỗi hiển thị: "08:00 - 17:30" */
export const formatHours = (l: BrandLocation): string | undefined =>
  l.hours?.opens && l.hours.closes ? `${l.hours.opens} - ${l.hours.closes}` : undefined;

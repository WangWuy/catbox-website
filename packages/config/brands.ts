/**
 * Nguồn sự thật duy nhất cho 3 thương hiệu.
 * 3 site = 3 domain riêng biệt, deploy thành 3 project Cloudflare Pages độc lập
 * từ cùng một repo (mỗi project trỏ root directory `sites/<brand>`).
 *
 * File này chỉ còn giữ phần **hạ tầng** — thứ chỉ đổi khi dev đổi cách deploy.
 * Phần **nội dung** (hotline, địa chỉ, sale, mạng xã hội, số liệu năng lực...)
 * đã chuyển sang `data/<brand>.json` để khách tự sửa qua Keystatic; xem
 * `settings.ts` để biết vì sao tách và `keystatic-fields.ts` cho form tương ứng.
 *
 * Hình dạng của `BRANDS` và chữ ký `getBrand()` KHÔNG đổi sau khi tách — hàng
 * chục component trong `packages/ui/` đọc thẳng `BRANDS[brand].x`, giữ nguyên
 * interface là giữ nguyên toàn bộ chỗ đó.
 */

import catboxSettings from "./data/catbox.json";
import cfcSettings from "./data/cfc.json";
import tettaSettings from "./data/tetta.json";
import {
  formatAddress,
  parseSettings,
  type BrandLocation,
  type BrandSettings,
  type BrandStat,
  type SalesRep,
} from "./settings";

export type { BrandLocation, BrandStat, SalesRep };

export type BrandId = "catbox" | "tetta" | "cfc";

/**
 * Hai brand dùng chung KHUNG F&B (@ui/brand/fnb): cùng topbar giá sỉ, cùng
 * CategoryNav e-commerce, chỉ khác token màu và nội dung.
 *
 * Catbox cố tình KHÔNG nằm trong nhóm này — site thương hiệu/studio có bộ
 * khung riêng ở @ui/brand/catbox. Kiểu này để TypeScript chặn ngay việc
 * truyền brand="catbox" vào component F&B, thay vì đẻ thêm nhánh if.
 */
export type FnbBrandId = Extract<BrandId, "tetta" | "cfc">;

export interface BrandContact {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

/** Phần hạ tầng — không CMS-hoá, xem chú thích đầu file */
interface BrandInfra {
  id: BrandId;
  /** Tên hiển thị ngắn trên Topbar Switcher */
  short: string;
  /** Tên icon Lucide (astro-icon), ví dụ "lucide:sparkles" */
  icon: string;
  /** Domain production — mỗi brand một domain riêng */
  domain: string;
  site: string;
  /** Màu thanh trình duyệt (<meta name="theme-color">). Phải khớp
   * `--color-theme` trong packages/tokens/<brand>.css — meta tag không đọc
   * được biến CSS nên buộc phải lặp giá trị ở đây, giữ 2 chỗ này đồng bộ. */
  themeColor: string;
  /** Favicon của brand — CFC dùng logo PNG, 2 brand còn lại dùng SVG */
  favicon: string;
  /** Ảnh OG mặc định (PNG 1200×630) dùng cho link preview mạng xã hội */
  ogImage?: string;
  /** Ngôn ngữ thật sự được dịch (§9: làm thật VI + EN, không để cờ chết) */
  locales: string[];
  defaultLocale: string;
}

/**
 * `BrandSettings` (từ CMS) + hạ tầng + `contacts` dựng sẵn.
 *
 * `contacts` là **dẫn xuất**, không phải field khách nhập: nó ghép email +
 * hotline + danh sách cơ sở thành một mảng phẳng cho Footer. Trước đây khách
 * phải nhập email hai lần (một ở `email`, một ở dòng `contacts`) và sửa lệch là
 * footer nói một đằng, JSON-LD nói một nẻo.
 */
export interface Brand extends BrandInfra, BrandSettings {
  contacts: BrandContact[];
}

const INFRA: Record<BrandId, BrandInfra> = {
  catbox: {
    id: "catbox",
    short: "CATBOX",
    icon: "lucide:sparkles",
    domain: "catbox.vn", // TODO: khách xác nhận domain thật
    site: "https://catbox.vn",
    themeColor: "#0B0B0B", // = --color-theme trong tokens/catbox.css
    favicon: "/favicon.svg",
    locales: ["vi", "en"],
    defaultLocale: "vi",
  },
  tetta: {
    id: "tetta",
    short: "TETTA",
    icon: "lucide:gift",
    domain: "tetta.vn", // TODO
    site: "https://tetta.vn",
    themeColor: "#8B1E2D", // = --color-theme trong tokens/tetta.css
    favicon: "/favicon.svg",
    locales: ["vi", "en"],
    defaultLocale: "vi",
  },
  cfc: {
    id: "cfc",
    short: "CFC",
    icon: "lucide:croissant",
    domain: "baobicfc.vn",
    site: "https://baobicfc.vn",
    themeColor: "#E67E22", // = --color-theme trong tokens/cfc.css
    favicon: "/logo.png",
    ogImage: "/og/og-image.png",
    locales: ["vi", "en"],
    defaultLocale: "vi",
  },
};

const RAW_SETTINGS: Record<BrandId, unknown> = {
  catbox: catboxSettings,
  tetta: tettaSettings,
  cfc: cfcSettings,
};

/** Email + hotline + từng cơ sở → mảng phẳng cho Footer (xem `Brand.contacts`) */
function buildContacts(s: BrandSettings): BrandContact[] {
  return [
    { icon: "lucide:mail", label: "Email", value: s.email, href: `mailto:${s.email}` },
    { icon: "lucide:phone", label: "Hotline", value: s.hotline, href: s.hotlineHref },
    ...s.locations.map((l) => ({
      icon: l.icon,
      label: l.label,
      value: formatAddress(l),
    })),
  ];
}

function build(id: BrandId): Brand {
  const settings = parseSettings(id, RAW_SETTINGS[id]);
  return { ...INFRA[id], ...settings, contacts: buildContacts(settings) };
}

export const BRANDS: Record<BrandId, Brand> = {
  catbox: build("catbox"),
  tetta: build("tetta"),
  cfc: build("cfc"),
};

/** Thứ tự cố định trên Topbar Switcher — Catbox (mẹ) luôn đứng đầu */
export const BRAND_ORDER: BrandId[] = ["catbox", "tetta", "cfc"];

export const getBrand = (id: BrandId): Brand => BRANDS[id];

/** Các brand còn lại — dùng cho khối Ecosystem và internal link chéo */
export const otherBrands = (id: BrandId): Brand[] =>
  BRAND_ORDER.filter((b) => b !== id).map((b) => BRANDS[b]);

/** Chính sách chung — 3 site dùng chung bộ policy slug */
export const POLICY_LINKS = [
  { label: "Chính sách thanh toán", href: "/policies/chinh-sach-thanh-toan" },
  { label: "Chính sách bảo hành", href: "/policies/chinh-sach-bao-hanh" },
  { label: "Điều khoản sử dụng", href: "/policies/dieu-khoan-su-dung" },
];

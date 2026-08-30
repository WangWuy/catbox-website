/**
 * Nguồn sự thật duy nhất cho 3 thương hiệu.
 * 3 site = 3 domain riêng biệt, deploy thành 3 project Cloudflare Pages độc lập
 * từ cùng một repo (mỗi project trỏ root directory `sites/<brand>`).
 *
 * ⚠️ Các giá trị `TODO` bên dưới chờ khách xác nhận (xem TECH_STACK_v2 §13).
 */

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

/** Một ô số liệu năng lực ("10+" / "Năm kinh nghiệm") */
export interface BrandStat {
  num: string;
  label: string;
  /** Tô màu CTA cho con số muốn nhấn */
  highlight?: boolean;
}

/** Nhân viên tư vấn bán hàng — hiển thị ở cột 2 Footer, bấm mở Zalo */
export interface SalesRep {
  name: string;
  phone: string;
}

export interface Brand {
  id: BrandId;
  /** Tên hiển thị ngắn trên Topbar Switcher */
  short: string;
  /** Tên icon Lucide (astro-icon), ví dụ "lucide:sparkles" */
  icon: string;
  name: string;
  tagline: string;
  /** Domain production — mỗi brand một domain riêng */
  domain: string;
  site: string;
  hotline: string;
  zalo: string;
  email: string;
  /** Dòng bảo chứng dưới logo (Catbox là brand mẹ nên không có) */
  memberOf?: string;
  searchPlaceholder: string;
  /** Pill khuyến mãi bên phải CategoryNav */
  promoPill: string;
  /** Nhãn nút pill xám ở MainHeader — thay cho "Đăng nhập/Đăng ký" (§3 TECH_STACK_v2) */
  headerCta: { label: string; href: string };
  /** CTA nhỏ trên Topbar — phải khác headerCta để không lặp chữ hai lần */
  topbarCta: { label: string; href: string };
  certifications: string[];
  /**
   * Số liệu năng lực — dùng ở StatsBar (/about-us) và khối cam kết trước form
   * (/contact). Để ở đây thay vì khai trong từng trang vì hai nơi phải khớp
   * nhau: số lệch giữa hai trang là mồi GEO sai (xem StatsBar.astro).
   */
  stats: BrandStat[];
  contacts: BrandContact[];
  /** Danh sách sale trực page — Footer cột "Tư vấn bán hàng" */
  salesReps: SalesRep[];
  /** Hotline phản ánh dịch vụ — tách khỏi hotline bán hàng */
  serviceHotlines: string[];
  legalName: string;
  /** Màu thanh trình duyệt (<meta name="theme-color">). Phải khớp
   * `--color-theme` trong packages/tokens/<brand>.css — meta tag không đọc
   * được biến CSS nên buộc phải lặp giá trị ở đây, giữ 2 chỗ này đồng bộ. */
  themeColor: string;
  /** Favicon của brand — CFC dùng logo PNG, 2 brand còn lại dùng SVG */
  favicon: string;
  /** Ngôn ngữ thật sự được dịch (§9: làm thật VI + EN, không để cờ chết) */
  locales: string[];
  defaultLocale: string;
  social: { label: string; href: string }[];
}

const LEGAL_NAME = "Công ty TNHH Đầu tư và Thương mại 2T";

const SHARED_CONTACTS: BrandContact[] = [
  { icon: "lucide:factory", label: "Nhà máy", value: "KCN Đồng Văn, Duy Tiên, Hà Nam" },
  { icon: "lucide:building-2", label: "Văn phòng", value: "Số 12 Nguyễn Trãi, Hà Đông, Hà Nội" },
];

/** ⚠️ TODO: thay bằng danh sách sale thật + số Zalo thật khi khách gửi */
const SHARED_SALES_REPS: SalesRep[] = [
  { name: "Tấn Thành", phone: "0986.83.9983" },
  { name: "Hải Yến", phone: "0915.02.9983" },
  { name: "Nguyễn Mai", phone: "0902.03.9983" },
  { name: "Hà Đại", phone: "0565.28.9983" },
  { name: "Anh Tuấn", phone: "0948.82.9983" },
  { name: "Mai Thanh", phone: "0915.82.9983" },
];

/** ⚠️ TODO: khách xác nhận hotline phản ánh dịch vụ */
const SHARED_SERVICE_HOTLINES = ["0901 52 52 62", "08 9983 9983", "0911 86 2879"];

export const BRANDS: Record<BrandId, Brand> = {
  catbox: {
    id: "catbox",
    short: "CATBOX",
    icon: "lucide:sparkles",
    name: "CATBOX Packaging",
    tagline: "Bao bì cao cấp",
    domain: "catbox.vn", // TODO: khách xác nhận domain thật
    site: "https://catbox.vn",
    hotline: "0988.xxx.xxx", // TODO
    zalo: "0988xxxxxx",
    email: "hello@catbox.vn",
    searchPlaceholder: "Tìm hộp cứng, hộp nắp gài, bao bì thương hiệu...",
    promoPill: "Miễn phí thiết kế 3D cho đơn từ 1.000 hộp",
    headerCta: { label: "Nhận tư vấn thiết kế", href: "/contact" },
    topbarCta: { label: "Nhận báo giá", href: "/contact" },
    certifications: ["ISO 9001", "FSC"],
    // TODO(nội dung): khách chưa cung cấp số liệu năng lực cho Catbox — để rỗng
    // thì khối stats tự ẩn, không bịa số (số sai là mồi GEO sai).
    stats: [],
    contacts: [
      { icon: "lucide:mail", label: "Email", value: "hello@catbox.vn", href: "mailto:hello@catbox.vn" },
      { icon: "lucide:phone", label: "Hotline", value: "0988.xxx.xxx", href: "tel:+84988000000" },
      ...SHARED_CONTACTS,
    ],
    salesReps: SHARED_SALES_REPS,
    serviceHotlines: SHARED_SERVICE_HOTLINES,
    themeColor: "#0B0B0B", // = --color-theme trong tokens/catbox.css
    favicon: "/favicon.svg",
    legalName: LEGAL_NAME,
    locales: ["vi", "en"],
    defaultLocale: "vi",
    social: [
      { label: "f", href: "#" },
      { label: "in", href: "#" },
      { label: "YT", href: "#" },
      { label: "TT", href: "#" },
    ],
  },

  tetta: {
    id: "tetta",
    short: "TETTA",
    icon: "lucide:gift",
    name: "TETTA Luxury Packaging",
    tagline: "Hộp quà Tết",
    domain: "tetta.vn", // TODO
    site: "https://tetta.vn",
    hotline: "0988.xxx.xxx", // TODO
    zalo: "0988xxxxxx",
    email: "tetta@2tprint.vn",
    memberOf: "A Member of Catbox Packaging Ecosystem",
    searchPlaceholder: "Tìm kiếm mẫu hộp quà Tết, ép kim...",
    promoPill: "Miễn phí thiết kế đơn VIP",
    headerCta: { label: "Nhận báo giá", href: "/contact" },
    topbarCta: { label: "Liên hệ", href: "/contact" },
    certifications: ["FSC", "ISO 9001"],
    // TODO(nội dung): khách chưa cung cấp số liệu năng lực cho Tetta.
    stats: [],
    contacts: [
      { icon: "lucide:mail", label: "Email", value: "tetta@2tprint.vn", href: "mailto:tetta@2tprint.vn" },
      { icon: "lucide:phone", label: "Hotline", value: "0988.xxx.xxx", href: "tel:+84988000000" },
      ...SHARED_CONTACTS,
    ],
    salesReps: SHARED_SALES_REPS,
    serviceHotlines: SHARED_SERVICE_HOTLINES,
    themeColor: "#8B1E2D", // = --color-theme trong tokens/tetta.css
    favicon: "/favicon.svg",
    legalName: LEGAL_NAME,
    locales: ["vi", "en"],
    defaultLocale: "vi",
    social: [
      { label: "f", href: "#" },
      { label: "in", href: "#" },
      { label: "YT", href: "#" },
      { label: "TT", href: "#" },
    ],
  },

  cfc: {
    id: "cfc",
    short: "CFC",
    icon: "lucide:croissant",
    name: "CFC Factory",
    tagline: "Bao bì F&B",
    domain: "cfc.vn", // TODO
    site: "https://cfc.vn",
    hotline: "0909.xxx.xxx", // TODO
    zalo: "0909xxxxxx",
    email: "cfc@2tprint.vn",
    memberOf: "A Member of Catbox Packaging Ecosystem",
    searchPlaceholder: "Tìm bao bánh mì que, túi Doner, cốc giấy...",
    promoPill: "Miễn phí giao hàng từ 2.000 túi",
    headerCta: { label: "Liên hệ tư vấn", href: "/contact" },
    topbarCta: { label: "Nhận báo giá", href: "/contact" },
    certifications: ["ATVSTP", "HACCP"],
    stats: [
      { num: "10+", label: "Năm kinh nghiệm" },
      { num: "5.000+", label: "Khách hàng đối tác" },
      { num: "20.000+", label: "Đơn hàng thành phẩm" },
      { num: "100%", label: "Đảm bảo chất lượng", highlight: true },
    ],
    contacts: [
      { icon: "lucide:mail", label: "Email", value: "cfc@2tprint.vn", href: "mailto:cfc@2tprint.vn" },
      { icon: "lucide:phone", label: "Hotline", value: "0909.xxx.xxx", href: "tel:+84909000000" },
      ...SHARED_CONTACTS,
    ],
    salesReps: SHARED_SALES_REPS,
    serviceHotlines: SHARED_SERVICE_HOTLINES,
    themeColor: "#E67E22", // = --color-theme trong tokens/cfc.css
    favicon: "/logo.png",
    legalName: LEGAL_NAME,
    locales: ["vi", "en"],
    defaultLocale: "vi",
    social: [
      { label: "f", href: "#" },
      { label: "in", href: "#" },
      { label: "YT", href: "#" },
      { label: "TT", href: "#" },
    ],
  },
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

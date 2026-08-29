/**
 * Nguồn sự thật duy nhất cho 3 thương hiệu.
 * 3 site = 3 domain riêng biệt, deploy thành 3 project Cloudflare Pages độc lập
 * từ cùng một repo (mỗi project trỏ root directory `sites/<brand>`).
 *
 * ⚠️ Các giá trị `TODO` bên dưới chờ khách xác nhận (xem TECH_STACK_v2 §13).
 */

export type BrandId = "catbox" | "tetta" | "cfc";

export interface BrandContact {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

export interface Brand {
  id: BrandId;
  /** Tên hiển thị ngắn trên Topbar Switcher */
  short: string;
  emoji: string;
  name: string;
  tagline: string;
  /** Mô tả 1 dòng dùng ở khối Ecosystem trước footer */
  ecoDesc: string;
  /** Nhãn phân loại ở khối Ecosystem */
  ecoTag: string;
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
  contacts: BrandContact[];
  legalName: string;
  /** Ngôn ngữ thật sự được dịch (§9: làm thật VI + EN, không để cờ chết) */
  locales: string[];
  defaultLocale: string;
  social: { label: string; href: string }[];
}

const LEGAL_NAME = "Công ty TNHH Đầu tư và Thương mại 2T";

const SHARED_CONTACTS: BrandContact[] = [
  { icon: "🏭", label: "Nhà máy", value: "KCN Đồng Văn, Duy Tiên, Hà Nam" },
  { icon: "🏢", label: "Văn phòng", value: "Số 12 Nguyễn Trãi, Hà Đông, Hà Nội" },
];

export const BRANDS: Record<BrandId, Brand> = {
  catbox: {
    id: "catbox",
    short: "CATBOX",
    emoji: "🌟",
    name: "CATBOX Packaging",
    tagline: "Bao bì cao cấp",
    ecoDesc: "Hộp cứng, hộp nắp gài và bao bì thương hiệu cho nhà bán lẻ.",
    ecoTag: "Anh cả",
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
    contacts: [
      { icon: "✉️", label: "Email", value: "hello@catbox.vn", href: "mailto:hello@catbox.vn" },
      { icon: "☎️", label: "Hotline", value: "0988.xxx.xxx", href: "tel:+84988000000" },
      ...SHARED_CONTACTS,
    ],
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
    emoji: "🎁",
    name: "TETTA Luxury Packaging",
    tagline: "Hộp quà Tết",
    ecoDesc: "Set quà tặng doanh nghiệp, hộp quà Tết theo mùa.",
    ecoTag: "Theo mùa",
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
    contacts: [
      { icon: "✉️", label: "Email", value: "tetta@2tprint.vn", href: "mailto:tetta@2tprint.vn" },
      { icon: "☎️", label: "Hotline", value: "0988.xxx.xxx", href: "tel:+84988000000" },
      ...SHARED_CONTACTS,
    ],
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
    emoji: "🥖",
    name: "CFC Factory",
    tagline: "Bao bì F&B",
    ecoDesc: "Túi giấy, giấy gói, hộp và cốc cho chuỗi bánh mì và bếp F&B.",
    // Nhãn khi CFC được nhắc tới TỪ site khác. Khi đang ở chính CFC,
    // EcosystemBlock tự thay bằng "Đang xem".
    ecoTag: "Giá sỉ",
    domain: "cfc.vn", // TODO
    site: "https://cfc.vn",
    hotline: "0909.xxx.xxx", // TODO
    zalo: "0909xxxxxx",
    email: "cfc@2tprint.vn",
    memberOf: "A Member of Catbox Packaging Ecosystem",
    searchPlaceholder: "Tìm bao bánh mì que, túi Doner, cốc giấy...",
    promoPill: "🚚 Miễn phí giao hàng từ 2.000 túi",
    headerCta: { label: "Bảng giá sỉ", href: "/bang-gia-si" },
    topbarCta: { label: "Nhận báo giá", href: "/contact" },
    certifications: ["ATVSTP", "HACCP"],
    contacts: [
      { icon: "✉️", label: "Email", value: "cfc@2tprint.vn", href: "mailto:cfc@2tprint.vn" },
      { icon: "☎️", label: "Hotline", value: "0909.xxx.xxx", href: "tel:+84909000000" },
      ...SHARED_CONTACTS,
    ],
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

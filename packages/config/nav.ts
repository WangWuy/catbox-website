import type { BrandId } from "./brands";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: { label: string; href: string }[];
}

/**
 * CategoryNav theo từng brand — TETTA_CFC_DESIGN_SPEC §2, hàng "Category Navigation".
 * Catbox theo SITEMAP_CATBOX.md (có Industry thay cho danh mục F&B).
 */
export const NAV: Record<BrandId, NavItem[]> = {
  catbox: [
    { label: "Trang chủ", href: "/", icon: "🌟" },
    { label: "Về chúng tôi", href: "/about-us", icon: "🏭" },
    {
      label: "Lĩnh vực",
      href: "/industry",
      icon: "🏢",
      children: [
        { label: "Mỹ phẩm", href: "/industry/my-pham" },
        { label: "Thời trang", href: "/industry/thoi-trang" },
        { label: "Thực phẩm", href: "/industry/thuc-pham" },
        { label: "Điện tử", href: "/industry/dien-tu" },
        { label: "Quà tặng doanh nghiệp", href: "/industry/qua-tang-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "📦" },
    { label: "Dự án", href: "/case-studies", icon: "🏆" },
    { label: "Chia sẻ", href: "/sharing", icon: "📰" },
    { label: "Liên hệ", href: "/contact", icon: "📞" },
  ],

  tetta: [
    { label: "Trang chủ", href: "/", icon: "🧧" },
    { label: "Về chúng tôi", href: "/about-us", icon: "🏭" },
    {
      label: "Bộ sưu tập",
      href: "/bo-suu-tap",
      icon: "🎁",
      children: [
        { label: "Hộp quà Tết", href: "/bo-suu-tap/hop-qua-tet" },
        { label: "Hộp rượu vang", href: "/bo-suu-tap/hop-ruou-vang" },
        { label: "Hộp yến sào", href: "/bo-suu-tap/hop-yen-sao" },
        { label: "Quà doanh nghiệp", href: "/bo-suu-tap/qua-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "📦" },
    { label: "Quy cách", href: "/services", icon: "📜" },
    { label: "Tin tức", href: "/blog", icon: "📰" },
    { label: "Liên hệ", href: "/contact", icon: "📞" },
  ],

  cfc: [
    { label: "Trang chủ", href: "/", icon: "🥖" },
    { label: "Về chúng tôi", href: "/about-us", icon: "🏭" },
    {
      label: "Sản phẩm",
      href: "/products",
      icon: "📦",
      children: [
        { label: "Túi giấy thực phẩm", href: "/danh-muc/tui-giay-thuc-pham" },
        { label: "Giấy gói thực phẩm", href: "/danh-muc/giay-goi-thuc-pham" },
        { label: "Hộp đựng thức ăn giấy", href: "/danh-muc/hop-dung-thuc-an" },
        { label: "Cốc giấy & ống hút", href: "/danh-muc/coc-giay-ong-hut" },
      ],
    },
    { label: "Bảng giá sỉ", href: "/bang-gia-si", icon: "💰" },
    { label: "Tin tức", href: "/blog", icon: "📰" },
    { label: "Liên hệ", href: "/contact", icon: "📞" },
  ],
};

/** Link phụ trên Topbar (bên cạnh hotline) */
export const TOPBAR_LINKS: Record<BrandId, { label: string; href: string }[]> = {
  catbox: [
    { label: "Về chúng tôi", href: "/about-us" },
    { label: "Năng lực sản xuất", href: "/about-us#nang-luc" },
  ],
  tetta: [
    { label: "Về chúng tôi", href: "/about-us" },
    { label: "Bộ sưu tập Tết", href: "/bo-suu-tap/hop-qua-tet" },
  ],
  cfc: [
    { label: "Về chúng tôi", href: "/about-us" },
    { label: "Bảng giá sỉ", href: "/bang-gia-si" },
  ],
};

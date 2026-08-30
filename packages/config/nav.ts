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
    { label: "Trang chủ", href: "/", icon: "lucide:sparkles" },
    { label: "Về chúng tôi", href: "/about-us", icon: "lucide:factory" },
    {
      label: "Lĩnh vực",
      href: "/industry",
      icon: "lucide:building-2",
      children: [
        { label: "Mỹ phẩm", href: "/industry/my-pham" },
        { label: "Thời trang", href: "/industry/thoi-trang" },
        { label: "Thực phẩm", href: "/industry/thuc-pham" },
        { label: "Điện tử", href: "/industry/dien-tu" },
        { label: "Quà tặng doanh nghiệp", href: "/industry/qua-tang-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "lucide:package" },
    { label: "Dự án", href: "/case-studies", icon: "lucide:trophy" },
    { label: "Chia sẻ", href: "/sharing", icon: "lucide:newspaper" },
    { label: "Liên hệ", href: "/contact", icon: "lucide:phone" },
  ],

  tetta: [
    { label: "Trang chủ", href: "/", icon: "lucide:gift" },
    { label: "Về chúng tôi", href: "/about-us", icon: "lucide:factory" },
    {
      label: "Bộ sưu tập",
      href: "/bo-suu-tap",
      icon: "lucide:gift",
      children: [
        { label: "Hộp quà Tết", href: "/bo-suu-tap/hop-qua-tet" },
        { label: "Hộp rượu vang", href: "/bo-suu-tap/hop-ruou-vang" },
        { label: "Hộp yến sào", href: "/bo-suu-tap/hop-yen-sao" },
        { label: "Quà doanh nghiệp", href: "/bo-suu-tap/qua-doanh-nghiep" },
      ],
    },
    { label: "Sản phẩm", href: "/products", icon: "lucide:package" },
    { label: "Quy cách", href: "/services", icon: "lucide:scroll-text" },
    { label: "Tin tức", href: "/blog", icon: "lucide:newspaper" },
    { label: "Liên hệ", href: "/contact", icon: "lucide:phone" },
  ],

  cfc: [
    { label: "Trang chủ", href: "/", icon: "lucide:croissant" },
    {
      label: "Túi Giấy",
      href: "/danh-muc/tui-giay-thuc-pham",
      icon: "lucide:shopping-bag",
      children: [
        { label: "Túi bánh mì que", href: "/products/tui-banh-mi-que-kraft" },
        { label: "Túi Doner Kebab", href: "/products/tui-doner-kebab" },
        { label: "Túi giấy có quai", href: "/products/tui-giay-co-quai" },
      ],
    },
    { label: "Giấy Gói", href: "/danh-muc/giay-goi-thuc-pham", icon: "lucide:file-text" },
    { label: "Hộp Giấy", href: "/danh-muc/hop-dung-thuc-an", icon: "lucide:package" },
    { label: "Cốc Giấy & Ống Hút", href: "/danh-muc/coc-giay-ong-hut", icon: "lucide:cup-soda" },
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
    { label: "Về Chúng Tôi", href: "/about-us" },
    { label: "Khuyến Mãi", href: "/bang-gia-si" },
  ],
};
